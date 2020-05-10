import { firebase } from '../../util/globals'
import { youtubeConfig } from '../../config/youtube'

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
