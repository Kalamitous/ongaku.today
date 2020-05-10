const initialState = { user: null, isSignedIn: null, playlists: null }
const firebaseReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SIGNED_IN_STATUS': return { ...state, isSignedIn: action.payload.status }
        case 'SET_USER': return action.payload.user ? { ...state, user: action.payload.user.user } : { ...state, user: null }
        case 'RETRIEVE_PLAYLISTS': return { ...state, playlists: action.payload.playlists }
        default: return state
    }
}

export default firebaseReducer
