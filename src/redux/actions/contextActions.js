export const openContext = (event, component, onClose) => ({
    type: 'OPEN_CONTEXT',
    payload: { event, component, onClose }
})

export const closeContext = () => {
    return (dispatch, getState) => {
        const callback = getState().context.onClose
        if (callback) callback()
        dispatch({ type: 'CLOSE_CONTEXT' })
    }
}

export const setContextHeight = height => ({
    type: 'SET_CONTEXT_HEIGHT',
    payload: { height }
})
