import React, { useState, useLayoutEffect, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { createItem, loadItem } from '../../../redux/actions/libraryActions'
import { closeContext, setContextHeight } from '../../../redux/actions/contextActions'
import { get, getName, isFolder } from '../../../util/library'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import CreateNewFolder from '@material-ui/icons/CreateNewFolder'
import ExitToApp from '@material-ui/icons/ExitToApp'
import Folder from '@material-ui/icons/Folder'
import Home from '@material-ui/icons/Home'
import LibraryAdd from '@material-ui/icons/LibraryAdd'
import VideoLibrary from '@material-ui/icons/VideoLibrary'
import './MoveContext.css'

const getInitCurId = (library, videoMode, moveFromParent) => {
    let id = library.curId
    if (videoMode && get(library, library.curId).parent && !isFolder(library, library.curId)) {
        id = get(library, library.curId).parent
    }
    if (moveFromParent) {
        id = get(library, id).parent
    }
    return id
}

const MoveContextItem = props => {
    const isFolder = props.isFolder
    return (
        <div className="ContextMenu-item MoveContext-item" onClick={props.handleClick}>
            <p>{isFolder ? <Folder /> : <VideoLibrary />}</p>
            <p>{props.text}</p>
            <p>{isFolder ? <ChevronRight /> : <ExitToApp />}</p>
        </div>
    )
}

const MoveContext = props => {
    const library = props.library
    const closeContext = props.closeContext
    const setContextHeight = props.setContextHeight
    const createItem = props.createItem
    const loadItem = props.loadItem
    const id = props.id
    const videoMode = props.videoMode
    const moveFromParent = props.moveFromParent
    const action = props.contextAction

    const ref = useRef()
    const [libraryItems, setLibraryItems] = useState([])
    const [curId, setCurId] = useState(getInitCurId(library, videoMode, moveFromParent))

    const contextAction = useCallback(id => {
        action(id)
        closeContext()
    }, [action, closeContext])

    useLayoutEffect(() => {
        setContextHeight(ref.current.clientHeight)
    }, [setContextHeight, libraryItems])

    // show folders then playlists
    useLayoutEffect(() => {
        setLibraryItems([])
        loadItem(curId).then(() => {
            const temp = []
            get(library, curId).folders.forEach(itemId => {
                if (itemId === id) return // don't show the item we want to move
                temp.push(<MoveContextItem
                    key={itemId}
                    text={getName(library, itemId)}
                    isFolder
                    handleClick={() => setCurId(itemId)} />
                )
            })
            if (videoMode) {
                get(library, curId).playlists.forEach(itemId => {
                    if (itemId === id) return
                    temp.push(<MoveContextItem
                        key={itemId}
                        text={getName(library, itemId)}
                        handleClick={() => contextAction(itemId)} />
                    )
                })
            }
            setLibraryItems(temp)
        })
    }, [library, loadItem, id, videoMode, curId, contextAction])

    const handleHeaderClick = () => {
        setCurId(get(library, curId).parent)
    }

    return (
        <div className="MoveContext" ref={ref}>
            <div className={curId === '0' ? 'ContextMenu-item title' : 'ContextMenu-item'} onClick={handleHeaderClick}>
                <p>{curId !== '0' ? <ChevronLeft /> : <Home />}</p>
                <p>{getName(library, curId)}</p>
            </div>
            <div className="horizontal-divider"></div>
            <div className="ContextMenu-marginHackContainer">
                <div className="ContextMenu-body">
                    {libraryItems}
                </div>
                {libraryItems.length > 5 ? <div className="ContextMenu-marginHackContainer-marginHack" /> : null}
            </div>
            {libraryItems.length > 0 ? <div className="horizontal-divider"></div> : null}
            <div className="ContextMenu-item" onClick={() => createItem('folder', curId)}>
                <p><CreateNewFolder /></p>
                <p>Create folder</p>
            </div>
            {videoMode ?
                <div className="ContextMenu-item" onClick={() => createItem('playlist', curId)}>
                    <p><LibraryAdd /></p>
                    <p>Create playlist</p>
                </div> :
                <div
                    className={
                        get(library, curId).folders.includes(id) || get(library, curId).playlists.includes(id) ?
                            'ContextMenu-item disabled' :
                            'ContextMenu-item'
                    }
                    onClick={() => contextAction(curId)}
                >
                    <p><ExitToApp /></p>
                    <p>Move here</p>
                </div>
            }
        </div>
    )
}

export default connect(
    state => ({
        library: state.library
    }),
    dispatch => ({
        closeContext: () => dispatch(closeContext()),
        setContextHeight: height => dispatch(setContextHeight(height)),
        createItem: (type, parent) => dispatch(createItem(type, parent)),
        loadItem: id => dispatch(loadItem(id))
    })
)(MoveContext)
