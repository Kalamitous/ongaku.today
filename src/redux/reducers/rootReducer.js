import { combineReducers } from 'redux'
import contextReducer from './contextReducer'
import firebaseReducer from './firebaseReducer'
import playerReducer from './playerReducer'
import libraryReducer from './libraryReducer'
import queueReducer from './queueReducer'

const appReducer = combineReducers({
    context: contextReducer,
    firebase: firebaseReducer,
    player: playerReducer,
    library: libraryReducer,
    queue: queueReducer
})

const rootReducer = (state, action) => {
    if (action.type === 'RESET_STATE') {
        state = {
            ...state,
            context: { content: null, pos: {x: 0, y: 0}, height: 0, open: false },
            firebase: { user: null, isSignedIn: null, playlists: null },
            player: { object: null, state: -1, curId: null, loopVideo: false, loopPlaylist: false },
            library: { objects: [], curId: '0' },
            queue: { ids: [], curIndex: 0 }
        }
        localStorage.removeItem('id')
        localStorage.removeItem('loopVideo')
        localStorage.removeItem('loopPlaylist')
        localStorage.removeItem('queue')
        localStorage.removeItem('index')
    }
    return appReducer(state, action)
}

export default rootReducer
