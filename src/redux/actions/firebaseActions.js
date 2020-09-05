import { loadAllItems, addPlaylistVideo, deletePlaylistVideo } from './libraryActions'
import { firebase, firestore } from '../../util/globals'
import { isFolder } from '../../util/library'
import { youtubeConfig } from '../../config'

export const initAuth = () => {
    return dispatch => { 
        return window.gapi.client.init(youtubeConfig).then(() => {
            const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get()
            dispatch(setSignedInStatus(isSignedIn))
            if (isSignedIn) {
                const googleUser = window.gapi.auth2.getAuthInstance().currentUser.get()
                return dispatch(signIn(googleUser))
            }
        })
    }
}

export const signIn = googleUser => {
    return dispatch => {
        const token = googleUser.getAuthResponse().id_token
        const creds = firebase.auth.GoogleAuthProvider.credential(token)
        return firebase.auth().signInWithCredential(creds).then(user => {
            if (user) {
                dispatch(setUser(user))
                dispatch(setSignedInStatus(true))
            }
        })
    }
}

export const signOut = () => {
    return dispatch => {
        return firebase.auth().signOut().then(() => {
            return window.gapi.auth2.getAuthInstance().signOut()
        })
        .then(() => { dispatch({ type: 'RESET_STATE' }) })
    }
}

export const setSignedInStatus = status => ({
    type: 'SET_SIGNED_IN_STATUS',
    payload: { status }
})

export const setUser = user => ({
    type: 'SET_USER',
    payload: { user }
})

export const retrievePlaylists = callback => {
    return (dispatch, getState) => {
        if (!getState().firebase.user) return
        return window.gapi.client.request({
            'path': 'https://www.googleapis.com/youtube/v3/playlists?fields=items(id,snippet(title))&part=snippet&mine=true&maxResults=50',
        })
        .then(response => {
            const playlists = response.result.items
            dispatch({ type: 'RETRIEVE_PLAYLISTS', payload: { playlists } })
        }, _ => callback()) // handle error
        .then(() => callback())
    }
}

// validate user data every 30 days as per youtube TOS
// invalid ids are prepended with '!'
export const validateData = () => {
    const maxResults = 50
    const curTime = Date.now()
    return (dispatch, getState) => {
        const uid = getState().firebase.user.uid
        firestore.collection(uid).doc('metadata').get().then(doc => {
            if (doc.exists) {
                const lastValidateTime = doc.data().lastValidateTime
                if (curTime - lastValidateTime >= 30 * 24 * 60 * 60 * 1000) {
                    dispatch(loadAllItems()).then(() => {
                        Object.entries(getState().library.objects).forEach(([key, value]) => {
                            if (isFolder(getState().library, key)) return
                            for (let i = 0; i < Math.ceil(value.videos.length / maxResults); i++) {
                                const ids = value.videos.slice(maxResults * i, maxResults * (i + 1))
                                const idString = ids.join(',')
                                window.gapi.client.request({
                                    'path': `https://www.googleapis.com/youtube/v3/videos?fields=items(id)&id=${idString}&maxResults=${maxResults}`,
                                }).then(response => {
                                    const validIds = response.result.items.map(item => item.id)
                                    const invalidIds = ids.filter(id => !validIds.includes(id));
                                    console.log(invalidIds)
                                    invalidIds.forEach(id => {
                                        if (id.substr(0, 1) !== '!') {
                                            dispatch(deletePlaylistVideo(key, id))
                                            dispatch(addPlaylistVideo(key, '!' + id))
                                        }
                                    })
                                })
                            }
                        })
                    }).then(() => {
                        firestore.collection(uid).doc('metadata').set({
                            lastValidateTime: curTime
                        })
                    })
                }
            } else {
                firestore.collection(uid).doc('metadata').set({
                    lastValidateTime: curTime
                })
            }
        })
    }
}
