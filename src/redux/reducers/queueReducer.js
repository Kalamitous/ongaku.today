const add = (state, payload) => {
    const set = new Set(state.ids.concat(payload.ids)) // removes duplicates
    const arr = Array.from(set)
    localStorage.setItem('queue', JSON.stringify(arr))
    return { ...state, ids: arr }
}

const remove = (state, payload) => {
    const index = state.ids.indexOf(payload.id)
    state.ids.splice(index, 1)
    if (state.curIndex >= index && state.curIndex > 0) state.curIndex--
    localStorage.setItem('queue', JSON.stringify(state.ids))
    localStorage.setItem('index', state.curIndex.toString())
    return { ids: state.ids, curIndex: state.curIndex }
}

const skip = (state, payload) => {
    const nextIndex = state.ids.indexOf(payload.id)
    if (nextIndex === -1) {
        state.ids.splice(state.curIndex + 1, 0, payload.id)
        state.curIndex++;
    } else {
        state.curIndex = nextIndex
    }
    localStorage.setItem('index', state.curIndex.toString())
    return { ...state, state }
}

const initialState = {
    ids: JSON.parse(localStorage.getItem('queue')) || [],
    curIndex: parseInt(localStorage.getItem('index')) || 0
}
const queueReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TO_QUEUE': return add(state, action.payload)
        case 'REMOVE_FROM_QUEUE': return remove(state, action.payload)
        case 'SET_QUEUE':
            localStorage.setItem('queue', JSON.stringify(state.ids))
            return {...state, ids: action.payload.ids}
        case 'SET_QUEUE_INDEX':
            localStorage.setItem('index', action.payload.index.toString())
            return {...state, curIndex: action.payload.index}
        case 'SKIP_TO_VIDEO': return skip(state, action.payload)
        case 'CLEAR_QUEUE':
            localStorage.removeItem('queue')
            localStorage.removeItem('index')
            return {ids: [], curIndex: 0}
        default: return state
    }
}

export default queueReducer
