import { firestore } from '../../util/globals'
import { getLoaded } from '../../util/library'

export const initLibrary = () => {
    return (dispatch, getState) => {
        if (getState().library.objects['0'] || !getState().firebase.user) return Promise.resolve()
        const uid = getState().firebase.user.uid
        return firestore.collection(uid).doc('0').get().then(doc => {
            if (!doc.exists) {
                const object = { folders: [], playlists: [] }
                firestore.collection(uid).doc('0').set(object)
                dispatch(setItem('0', object))
            } else {
                dispatch(setItem('0', doc.data()))
            }
        })
    }
}

export const createItem = (type, parent) => {
    return (dispatch, getState) => {
        dispatch({type: 'CREATE_ITEM', payload: { type, parent, uid: getState().firebase.user.uid }})
    }
}

export const setItem = (id, object) => ({
    type: 'SET_ITEM',
    payload: { id, object }
})

export const removeItem = id => {
    return (dispatch, getState) => {
        dispatch({type: 'REMOVE_ITEM', payload: { id, uid: getState().firebase.user.uid }})
    }
}

export const moveItem = (id, index) => {
    return (dispatch, getState) => {
        dispatch({type: 'MOVE_ITEM', payload: { id, index, uid: getState().firebase.user.uid }})
    }
}

export const loadItem = id => {
    return (dispatch, getState) => {
        if (!getLoaded(getState().library, id)) {
            return firestore.collection(getState().firebase.user.uid).where('parent', '==', id).get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    dispatch(setItem(doc.id, doc.data()))
                })
            })
        }
        return Promise.resolve()
    }
}

export const setItemName = (id, name) => {
    return (dispatch, getState) => {
        dispatch({ type: 'SET_ITEM_NAME', payload: { id, name, uid: getState().firebase.user.uid } })
    }
}

export const setItemParent = (id, parent) => {
    return (dispatch, getState) => {
        dispatch({ type: 'SET_ITEM_PARENT', payload: { id, parent, uid: getState().firebase.user.uid } })
    }
}

export const setItemView = id => ({
    type: 'SET_ITEM_VIEW',
    payload: { id }
})

export const addPlaylistVideo = (playlistId, videoId) => {
    return (dispatch, getState) => {
        dispatch({ type: 'ADD_PLAYLIST_VIDEO', payload: { playlistId, videoId, uid: getState().firebase.user.uid } })
    }
}

export const addPlaylistBatch = (playlistId, batch) => {
    return (dispatch, getState) => {
        dispatch({ type: 'ADD_PLAYLIST_BATCH', payload: { playlistId, batch, uid: getState().firebase.user.uid } })
    }
}

export const deletePlaylistVideo = (playlistId, videoId) => {
    return (dispatch, getState) => {
        dispatch({ type: 'DELETE_PLAYLIST_VIDEO', payload: { playlistId, videoId, uid: getState().firebase.user.uid } })
    }
}

export const movePlaylistVideo = (playlistId, videoId, index) => {
    return (dispatch, getState) => {
        dispatch({ type: 'MOVE_PLAYLIST_VIDEO', payload: { playlistId, videoId, index, uid: getState().firebase.user.uid } })
    }
}
