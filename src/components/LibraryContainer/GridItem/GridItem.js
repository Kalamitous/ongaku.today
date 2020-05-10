import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { openContext } from '../../../redux/actions/contextActions'
import { removeItem, setItemName, setItemParent, setItemView } from '../../../redux/actions/libraryActions'
import { SortableHandle } from 'react-sortable-hoc'
import MoreContext from '../../ContextMenu/MoreContext'
import MoveContext from '../../ContextMenu/MoveContext/MoveContext'
import DragHandleIcon from '@material-ui/icons/DragHandle'
import MoreHoriz from '@material-ui/icons/MoreHoriz'
import './GridItem.css'

const DragHandle = SortableHandle(() => <DragHandleIcon />)

const GridItem = props => {
    const openContext = props.openContext
    const removeItem = props.removeItem
    const setItemName = props.setItemName
    const setItemParent = props.setItemParent
    const setItemView = props.setItemView
    const id = props.id
    const name = props.name
    const type = props.type

    const ref = useRef()

    const removeActiveClass = () => {
        document.querySelector(`.${type}-buttonContainer-buttons.active`).classList.remove('active')
    }
    const handleMore = event => {
        event.stopPropagation() // prevent buttonContainer's onClick from firing
        event.currentTarget.parentNode.classList.add('active')
        openContext(
            event, 
            <MoreContext
                handleEdit={handleEdit}
                handleMove={handleMove({clientX: event.clientX, clientY: event.clientY})}
                handleDelete={handleDelete}
            />,
            removeActiveClass
        )
    }
    const handleMove = event => (() => {
        const contextAction = curId => {
            if (id === curId) return
            setItemParent(id, curId)
        }
        openContext(event, <MoveContext id={id} contextAction={contextAction} />, removeActiveClass)
    })
    const handleDelete = () => {
        removeItem(id)
    }
    const handleEdit = () => {
        ref.current.innerText = ''
        ref.current.focus()
    }
    const handleBlur = event => {
        const text = event.target.innerText
        if (text !== '') {
            setItemName(id, text)
        } else {
            event.target.innerText = name
        }
        event.target.blur() // blur when window loses focus as well
    }
    const handleChange = event => {
        const maxLength = 24
        if (event.target.innerText.length >= maxLength) {
            event.target.innerText = event.target.innerText.substring(0, maxLength + 1)
            event.target.blur()
        }
        if (event.keyCode === 13) event.target.blur() // blur on enter key
    }

    return (
        <div className={type}>
            <div className={`${type}-buttonContainer`} onClick={() => setItemView(id)}>
                <div className={`${type}-buttonContainer-buttons`}>
                    <h4 className={`${type}-buttonContainer-buttons-drag`}><DragHandle /></h4>
                    <h4 onClick={handleMore}><MoreHoriz /></h4>
                </div>
            </div>
            <div className={`${type}-text`}>
                <h5 
                    ref={ref}
                    contentEditable="true"
                    spellCheck="false"
                    onBlur={handleBlur}
                    onKeyDown={handleChange}
                    suppressContentEditableWarning={true}
                >{name}</h5>
            </div>
        </div>
    )
}

export default connect(
    null,
    dispatch => ({
        openContext: (event, component, onClose) => dispatch(openContext(event, component, onClose)),
        removeItem: id => dispatch(removeItem(id)),
        setItemName: (id, name) => dispatch(setItemName(id, name)),
        setItemParent: (id, parent) => dispatch(setItemParent(id, parent)),
        setItemView: id => dispatch(setItemView(id))
    })
)(GridItem)
