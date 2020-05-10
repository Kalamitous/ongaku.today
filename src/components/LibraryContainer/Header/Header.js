import React, { useState, useLayoutEffect, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { openContext } from '../../../redux/actions/contextActions'
import { loadItem, removeItem, setItemParent, setItemView } from '../../../redux/actions/libraryActions'
import { addToQueue } from '../../../redux/actions/queueActions'
import { get, getName, getAllVideos, isFolder } from '../../../util/library'
import ImportContext from '../../ContextMenu/ImportContext/ImportContext'
import MoreContext from '../../ContextMenu/MoreContext'
import MoveContext from '../../ContextMenu/MoveContext/MoveContext'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import MoreHoriz from '@material-ui/icons/MoreHoriz'
import PlaylistPlay from '@material-ui/icons/PlaylistPlay'
import './Header.css'

const Header = props => {
    const library = props.library
    const openContext = props.openContext
    const loadItem = props.loadItem
    const removeItem = props.removeItem
    const setItemParent = props.setItemParent
    const setItemView = props.setItemView
    const addToQueue = props.addToQueue

    const ref = useRef()
    const [Breadcrumbs, setBreadcrumbs] = useState([])

    const updateBreadcrumbs = useCallback(() => {
        const populatePath = (id, arr) => {
            if (library.objects[id]) {
                arr.push(id)
                populatePath(library.objects[id].parent, arr)
            }
        }
        let temp = []
        let itemPath = []
        populatePath(library.curId, itemPath)
        itemPath.forEach(id => {
            temp.unshift(
                <Breadcrumb
                    key={id}
                    id={id}
                    name={getName(library, id)}
                />
            )
        })
        setBreadcrumbs(temp)
    }, [library])
    
    useLayoutEffect(() => {
        updateBreadcrumbs()
    }, [library.curId, updateBreadcrumbs])

    useLayoutEffect(() => {
        const updateScroll = () => ref.current.scrollLeft = ref.current.scrollWidth
        updateScroll()
        window.addEventListener('resize', updateScroll)
        return () => window.removeEventListener('resize', updateScroll)
    }, [ref, Breadcrumbs])
    
    const handleMore = event => {
        openContext(
            event, 
            <MoreContext
                handleEdit={handleEdit}
                handleMove={handleMove({clientX: event.clientX, clientY: event.clientY})}
                handleImport={
                    !isFolder(library, library.curId) ? 
                        handleImport({clientX: event.clientX, clientY: event.clientY}) :
                        null
                }
                handleDelete={handleDelete}
            />
        )
    }
    const handleMove = event => (() => {
        const contextAction = curId => {
            if (library.curId === curId) return
            setItemParent(library.curId, curId)
        }
        openContext(
            event,
            <MoveContext
                id={library.curId}
                contextAction={contextAction}
                moveFromParent // initialize MoveContext to be in parent of current item
            />
        )
    })
    const handleEdit = () => {
        // get h3 of current breadcrumb
        const breadcrumbs = ref.current.children[0].children
        const curBreadcrumb = breadcrumbs[breadcrumbs.length - 1].children[0].children[0]
        curBreadcrumb.innerText = ''
        curBreadcrumb.focus()
    }
    const handleImport = event => (() =>
        openContext(event, <ImportContext />)
    )
    const handleDelete = () => {
        setItemView(get(library, library.curId).parent)
        removeItem(library.curId)
    }
    const handleQueue = () => {
        getAllVideos(library, library.curId, loadItem)
        .then(videos => {
            addToQueue(videos)
        })
    }

    return (
        <div className="Header">
            <div className="Header-tree" ref={ref}>
                <div className="Header-tree-inner">
                    {Breadcrumbs}
                </div> 
            </div> 
            <div className="Header-buttonContainer">
                <div className="Header-buttonContainer-button" onClick={handleQueue}>
                    <h3><PlaylistPlay /></h3>
                </div>
                {library.curId !== '0' ?
                    <div className="Header-buttonContainer-button" onClick={handleMore}>
                        <h3><MoreHoriz /></h3>
                    </div> :
                    null
                }
            </div>
        </div>
    )
}

export default connect(
    state => ({
        library: state.library
    }),
    dispatch => ({
        openContext: (event, component) => dispatch(openContext(event, component)),
        loadItem: id => dispatch(loadItem(id)),
        removeItem: id => dispatch(removeItem(id)),
        setItemParent: (id, parent) => dispatch(setItemParent(id, parent)),
        setItemView: id => dispatch(setItemView(id)),
        addToQueue: ids => dispatch(addToQueue(ids))
    })
)(Header)
