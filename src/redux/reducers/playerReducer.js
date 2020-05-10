const set = (state, payload) => {
    return {...state, object: payload.object}
}

const setState = (state, payload) => {
    return {...state, state: payload.state}
}

const stop = state => {
    state.object.stopVideo()
    localStorage.removeItem('id')
    return {...state, curId: null}
}

const play = (state, payload) => {
    if (!state.object) return state
    state.object.loadVideoById(payload.id)
    localStorage.setItem('id', payload.id)
    return {...state, curId: payload.id}
}

const cue = (state, payload) => {
    if (!state.object) return state
    state.object.cueVideoById(payload.id)
    localStorage.setItem('id', payload.id)
    return {...state, curId: payload.id}
}

const initialState = {
    object: null,
    state: -1,
    curId: localStorage.getItem('id'),
    loopVideo: localStorage.getItem('loopVideo') === 'true' || false,
    loopPlaylist: localStorage.getItem('loopPlaylist') === 'true' || false
}

const playerReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_PLAYER': return set(state, action.payload)
        case 'SET_PLAYER_STATE': return setState(state, action.payload)
        case 'STOP_PLAYER': return stop(state)
        case 'PLAY_VIDEO': return play(state, action.payload)
        case 'CUE_VIDEO': return cue(state, action.payload)
        case 'TOGGLE_LOOP_VIDEO':
            localStorage.setItem('loopVideo', !state.loopVideo)
            return {...state, loopVideo: !state.loopVideo}
        case 'TOGGLE_LOOP_PLAYLIST':
            localStorage.setItem('loopPlaylist', !state.loopPlaylist)
            return {...state, loopPlaylist: !state.loopPlaylist}
        default: return state
    }
}

export default playerReducer
