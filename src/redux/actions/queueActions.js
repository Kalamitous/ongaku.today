import { stopPlayer, playVideo, cueVideo } from '../actions/playerActions'

export const addToQueue = ids => {
    return (dispatch, getState) => {
        if (ids.length === 0) return
        if (getState().queue.ids.length === 0) {
            dispatch(cueVideo(ids[0]))
        }
        dispatch({ type: 'ADD_TO_QUEUE', payload: { ids } })
    }
}

export const removeFromQueue = id => {
    return (dispatch, getState) => {
        const queue = getState().queue
        const index = queue.ids.indexOf(id)
        if (index === queue.curIndex) {
            if (index === queue.ids.length - 1 && index > 0) { // cue previous if removing last in queue
                dispatch(cueVideo(queue.ids[index - 1]))
            } else if (index < queue.ids.length - 1) { // play/cue next if there are more in queue
                if (getState().player.state === 5) {
                    dispatch(cueVideo(queue.ids[index + 1]))
                } else {
                    dispatch(playVideo(queue.ids[index + 1]))
                }
            } else { // nothing left in queue
                dispatch(stopPlayer())
            }
        }
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: { id } })
    }
}

export const moveInQueue = (id, newIndex) => {
    return (dispatch, getState) => {
        const queue = getState().queue
        const curId = queue.ids[queue.curIndex]
        const oldIndex = queue.ids.indexOf(id)
        if (newIndex >= queue.ids.length || newIndex < 0) return
        const item = queue.ids.splice(oldIndex, 1)[0]
        queue.ids.splice(newIndex, 0, item)
        if (getState().player.state !== 5) { // update index to correspond to the same video if it is playing
            dispatch(setQueueIndex(queue.ids.indexOf(curId)))
        } else { // cue new video that took the original video's place if it was cued
            dispatch(cueVideo(queue.ids[queue.curIndex]))
        }
        const ids = queue.ids
        dispatch({ type: 'SET_QUEUE', payload: { ids } })
    }
}

export const setQueue = ids => ({
    type: 'SET_QUEUE',
    payload: { ids }
})

export const setQueueIndex = index => ({
    type: 'SET_QUEUE_INDEX',
    payload: { index }
})

export const skipToVideo = id => ({
    type: 'SKIP_TO_VIDEO',
    payload: { id }
})

export const shuffleQueue = () => {
    return (dispatch, getState) => {
        const queue = getState().queue
        if (queue.length === 0) return
        const curId = queue.ids[queue.curIndex]
        queue.ids.sort(() => Math.random() - 0.5)
        if (getState().player.state !== 5) {
            dispatch(setQueueIndex(queue.ids.indexOf(curId)))
        } else {
            dispatch(cueVideo(queue.ids[queue.curIndex]))
        }
        let ids = queue.ids
        if (typeof(ids[0]) === 'undefined') ids = []
        dispatch({ type: 'SET_QUEUE', payload: { ids } })
    }
}

export const clearQueue = () => {
    return dispatch => {
        dispatch(stopPlayer())
        dispatch({ type: 'CLEAR_QUEUE' })
    }
}
