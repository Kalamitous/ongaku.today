import React from 'react'
import { connect } from 'react-redux'
import { setItemName, setItemView } from '../../../redux/actions/libraryActions'
import ChevronRight from '@material-ui/icons/ChevronRight'
import './Breadcrumb.css'

const Breadcrumb = props => {
    const setItemName = props.setItemName
    const setItemView = props.setItemView
    const id = props.id
    const name = props.name

    const handleClick = () => setItemView(id)
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
        <div className="Breadcrumb">
            <div className="Breadcrumb-button" onClick={handleClick}>
                <h3
                    contentEditable="true"
                    spellCheck="false"
                    onBlur={handleBlur}
                    onKeyDown={handleChange}
                    suppressContentEditableWarning={true}
                >{name}</h3>
                <div className="Breadcrumb-button-mask" />
            </div>
            <div className="Breadcrumb-chevron">
                <h3><ChevronRight /></h3>
            </div>
        </div>
    )
}

export default connect(
    null,
    dispatch => ({
        setItemName: (id, name) => dispatch(setItemName(id, name)),
        setItemView: id => dispatch(setItemView(id))
    })
)(Breadcrumb)
