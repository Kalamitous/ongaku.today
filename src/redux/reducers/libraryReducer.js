import { firebase, firestore } from '../../util/globals'
import { getTypeFromID, isFolder } from '../../util/library'

const create = (state, payload) => {
    let type;
    let object = {}
    if (payload.type === 'folder') {
        type = 'folders'
        object = { name: null, parent: payload.parent, folders: [], playlists: [] }
    } else if (payload.type === 'playlist') {
        type = 'playlists'
        object = { name: null, parent: payload.parent, videos: [] }
    }
    const ref = firestore.collection(payload.uid).doc()
    state.objects[ref.id] = object
    state.objects[payload.parent][type].push(ref.id)
    ref.set(object).then(() => {
        firestore.collection(payload.uid).doc(payload.parent).update({
            [type]: firebase.firestore.FieldValue.arrayUnion(ref.id)
        })
    })
    return { ...state, objects: state.objects }
}

const set = (state, payload) => {
    state.objects[payload.id] = payload.object
    return { ...state, objects: state.objects }
}

const remove = (state, payload) => {
    // remove playlist from parent (don't perform on children)
    const type = getTypeFromID(state, payload.id)
    const parentId = state.objects[payload.id].parent
    const siblings = state.objects[parentId][type]
    siblings.splice(siblings.indexOf(payload.id), 1)
    firestore.collection(payload.uid).doc(parentId).update({
        [type]: firebase.firestore.FieldValue.arrayRemove(payload.id)
    })
    const removeChildrenAndSelf = (state, id) => {
        if (isFolder(state, id)) {
            state.objects[id].folders.forEach((childId) => {
                removeChildrenAndSelf(state, childId)
            })
            state.objects[id].playlists.forEach((childId) => {
                removeChildrenAndSelf(state, childId)
            })
        }
        delete state.objects[id]
        firestore.collection(payload.uid).doc(id).delete()
    }
    removeChildrenAndSelf(state, payload.id)
    return { ...state, objects: state.objects }
}

const move = (state, payload) => {
    const type = getTypeFromID(state, payload.id)
    const arr = state.objects[state.curId][type]
    const index = arr.indexOf(payload.id)
    if (payload.index >= arr.length || payload.index < 0) return state
    const id = arr.splice(index, 1)[0]
    arr.splice(payload.index, 0, id)
    firestore.collection(payload.uid).doc(state.curId).update({
        [type]: arr
    })
    return { ...state, objects: state.objects }
}

const setName = (state, payload) => {
    state.objects[payload.id].name = payload.name
    firestore.collection(payload.uid).doc(payload.id).update({ name: payload.name })
    return { ...state, objects: state.objects }
}

const setParent = (state, payload) => {
    let parentId = state.objects[payload.id].parent
    const type = getTypeFromID(state, payload.id)
    const childIndex = state.objects[parentId][type].indexOf(payload.id)
    state.objects[parentId][type].splice(childIndex, 1)
    state.objects[payload.parent][type].push(payload.id)
    state.objects[payload.id].parent = payload.parent
    firestore.collection(payload.uid).doc(parentId).update({
        [type]: firebase.firestore.FieldValue.arrayRemove(payload.id)
    })
    firestore.collection(payload.uid).doc(payload.parent).update({
        [type]: firebase.firestore.FieldValue.arrayUnion(payload.id)
    })
    firestore.collection(payload.uid).doc(payload.id).update({
        parent: payload.parent
    })
    return { ...state, objects: state.objects }
}

const setView = (state, payload) => {
    return { ...state, curId: payload.id }
}

const addVideo = (state, payload) => {
    let videos = state.objects[payload.playlistId].videos
    if (videos.includes(payload.videoId)) return state
    videos.push(payload.videoId)
    firestore.collection(payload.uid).doc(payload.playlistId).update({
        videos: firebase.firestore.FieldValue.arrayUnion(payload.videoId)
    })
    return { ...state, objects: state.objects }
}

const addBatch = (state, payload) => {
    let videos = state.objects[payload.playlistId].videos
    const set = new Set(videos.concat(payload.batch))
    state.objects[payload.playlistId].videos = Array.from(set)
    firestore.collection(payload.uid).doc(payload.playlistId).update({
        videos: state.objects[payload.playlistId].videos
    })
    return { ...state, objects: state.objects }
}

const deleteVideo = (state, payload) => {
    const index = state.objects[payload.playlistId].videos.indexOf(payload.videoId)
    if (index === -1) return
    state.objects[payload.playlistId].videos.splice(index, 1)
    firestore.collection(payload.uid).doc(payload.playlistId).update({
        videos: firebase.firestore.FieldValue.arrayRemove(payload.videoId)
    })
    return { ...state, objects: state.objects }
}

const moveVideo = (state, payload) => {
    const arr = state.objects[payload.playlistId].videos
    const index = arr.indexOf(payload.videoId)
    if (payload.index >= arr.length || payload.index < 0) return state
    const id = arr.splice(index, 1)[0]
    arr.splice(payload.index, 0, id)
    firestore.collection(payload.uid).doc(payload.playlistId).update({
        videos: arr
    })
    return { ...state, objects: state.objects }
}

const initialState = { objects: [], curId: '0' }
const libraryReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'CREATE_ITEM': return create(state, action.payload)
        case 'SET_ITEM': return set(state, action.payload)
        case 'REMOVE_ITEM': return remove(state, action.payload)
        case 'MOVE_ITEM': return move(state, action.payload)
        case 'SET_ITEM_NAME': return setName(state, action.payload)
        case 'SET_ITEM_PARENT': return setParent(state, action.payload)
        case 'SET_ITEM_VIEW': return setView(state, action.payload)
        case 'ADD_PLAYLIST_VIDEO': return addVideo(state, action.payload)
        case 'ADD_PLAYLIST_BATCH': return addBatch(state, action.payload)
        case 'DELETE_PLAYLIST_VIDEO': return deleteVideo(state, action.payload)
        case 'MOVE_PLAYLIST_VIDEO': return moveVideo(state, action.payload)
        default: return state
    }
}

export default libraryReducer
