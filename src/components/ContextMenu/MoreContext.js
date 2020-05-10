import React from 'react'
import { connect } from 'react-redux'
import { closeContext } from '../../redux/actions/contextActions'
import CloudDownload from '@material-ui/icons/CloudDownload'
import Delete from '@material-ui/icons/Delete'
import Edit from '@material-ui/icons/Edit'
import ExitToApp from '@material-ui/icons/ExitToApp'

const MoreContext = props => {
    const closeContext = props.closeContext
    const handleMove = props.handleMove
    const handleImport = props.handleImport
    const deleteText = props.deleteText || 'Delete'

    const handleEdit = () => {
        props.handleEdit()
        closeContext()
    }
    const handleDelete = () => {
        props.handleDelete()
        closeContext()
    }

    return (
        <div className="MoreContext">
            {props.handleImport ?
                <div className="ContextMenu-item" onClick={handleImport}>
                    <p><CloudDownload /></p>
                    <p>Import</p>
                </div> :
                null
            }
            {props.handleEdit ? 
                <div className="ContextMenu-item" onClick={handleEdit}>
                    <p><Edit /></p>
                    <p>Edit name</p>
                </div> :
                null
            }
            <div className="ContextMenu-item" onClick={handleMove}>
                <p><ExitToApp /></p>
                <p>Move to</p>
            </div>
            <div className="ContextMenu-item" onClick={handleDelete}>
                <p><Delete /></p>
                <p>{deleteText}</p>
            </div>
        </div>
    )
}

export default connect(
    null,
    dispatch => ({
        closeContext: () => dispatch(closeContext())
    })
)(MoreContext)
