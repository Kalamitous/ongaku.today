const open = (state, payload) => ({
    ...state,
    content: payload.component,
    pos: { x: payload.event.clientX, y: payload.event.clientY },
    onClose: payload.onClose,
    open: true
})

const initialState = { content: null, pos: {x: 0, y: 0}, height: 0, onClose: null, open: false }
const contextReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'OPEN_CONTEXT': return open(state, action.payload)
        case 'CLOSE_CONTEXT': return initialState
        case 'SET_CONTEXT_HEIGHT': return { ...state, height: action.payload.height }
        default: return state
    }
}

export default contextReducer
