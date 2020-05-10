import { skipToVideo } from '../actions/queueActions'

export const setPlayer = object => ({
    type: 'SET_PLAYER',
    payload: { object }
})

export const setPlayerState = state => ({
    type: 'SET_PLAYER_STATE',
    payload: { state }
})

export const stopPlayer = () => ({
    type: 'STOP_PLAYER'
})

export const playVideo = id => {
    return dispatch => {
        dispatch(skipToVideo(id))
        dispatch({ type: 'PLAY_VIDEO', payload: { id } })
    }
}

export const cueVideo = id => {
    return dispatch => {
        dispatch(skipToVideo(id))
        dispatch({ type: 'CUE_VIDEO', payload: { id } })
    }
}

export const toggleLoopVideo = () => ({
    type: 'TOGGLE_LOOP_VIDEO'
})

export const toggleLoopPlaylist = () => ({
    type: 'TOGGLE_LOOP_PLAYLIST'
})
