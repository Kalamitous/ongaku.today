import React, { useState, useLayoutEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { closeContext } from '../../redux/actions/contextActions'
import './ContextMenu.css'

const ContextMenu = props => {
    const context = props.context
    const closeContext = props.closeContext
    
    const ref = useRef()
    const [pos, setPos] = useState(context.pos)

    useLayoutEffect(() => {
        const disappear = event => {
            if (event.type === 'mousedown' && ref.current.contains(event.target)) return
            closeContext()
        }
        window.addEventListener('mousedown', disappear)
        window.addEventListener('resize', disappear)
        return () => {
            window.removeEventListener('mousedown', disappear)
            window.removeEventListener('resize', disappear)
        }
    }, [closeContext, ref])

    useLayoutEffect(() => {
        const contextWidth = ref.current.clientWidth
        let contextHeight = context.height
        let newX = context.pos.x
        let newY = context.pos.y
        if (!contextHeight) contextHeight = ref.current.clientHeight
        if (context.pos.x + contextWidth > document.body.offsetWidth) newX = context.pos.x - contextWidth
        if (context.pos.y + contextHeight > document.body.offsetHeight) newY = context.pos.y - contextHeight
        setPos({x: newX, y: newY})
    }, [context.pos, context.height])

    return (
        <div className="ContextMenu" ref={ref} style={{ top: pos.y, left: pos.x }}>
            {context.content}
        </div>
    )
}

export default connect(
    state => ({
        context: state.context
    }),
    dispatch => ({
        closeContext: () => dispatch(closeContext())
    })
)(ContextMenu)
