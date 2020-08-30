import React, { useState, useLayoutEffect } from 'react'
import { connect } from 'react-redux'
import {
    createItem,
    loadItem,
    addPlaylistVideo,
    deletePlaylistVideo,
    movePlaylistVideo
} from '../../redux/actions/libraryActions'
import { get, getLatestChildOfType, isFolder } from '../../util/library'
import AddVideo from './AddVideo/AddVideo'
import Header from './Header/Header'
import Grid from './Grid/Grid'
import VideoList from '../VideoList/VideoList'
import Add from '@material-ui/icons/Add'
import './LibraryContainer.css'

const LibraryContainer = props => {
    const library = props.library
    const loadItem = props.loadItem
    const addPlaylistVideo = props.addPlaylistVideo
    const deletePlaylistVideo = props.deletePlaylistVideo
    const movePlaylistVideo = props.movePlaylistVideo

    const [loaded, setLoaded] = useState(false)
    const [searchResultIds, setSearchResultIds] = useState([])
    const [createdItem, setCreatedItem] = useState()
    const [resetScroll, setResetScroll] = useState(false)

    const curId = library.curId
    const curPlaylist = get(library, curId)
    
    useLayoutEffect(() => {
        // reset states when changing views
        setLoaded(false)
        setSearchResultIds([])
        loadItem(curId).then(() => setLoaded(true))
    }, [curId, loadItem])

    // prompt user to enter name for the created item upon GridItem load
    useLayoutEffect(() => {
        if (!createdItem) return
        const focus = event => {
            const id = event.detail.id
            const handleEdit = event.detail.handleEdit
            if (id !== createdItem) return
            handleEdit()
            setCreatedItem(null)
        }
        window.addEventListener('onItemCreate', focus)
        return () => window.removeEventListener('onItemCreate', focus)
    }, [createdItem])

    // hack to scroll to the top of the video list when switching between playlist and video search views
    // `resetScroll` is true for the duration of one render when `searchResultIds` has changed
    useLayoutEffect(() => {
        setResetScroll(true)
    }, [searchResultIds])
    useLayoutEffect(() => {
        setResetScroll(false)
    }, [resetScroll])

    console.log(resetScroll)

    const handleAdd = id => addPlaylistVideo(curId, id)
    const handleToggle = id => !curPlaylist.videos.includes(id)
    const handleDelete = id => deletePlaylistVideo(curId, id)

    const createItem = (type, parent) => {
        props.createItem(type, parent)
        setCreatedItem(getLatestChildOfType(type, library, parent))
    }
    const onSortEnd = (oldIndex, newIndex) => {
        const videoId = get(library, curId).videos[oldIndex]
        movePlaylistVideo(curId, videoId, newIndex)
    }

    return (
        <div className="LibraryContainer">
            <Header />
            <div className="horizontal-divider" />
            {isFolder(library, curId) ?
                <div className="LibraryContainer-subHeader">
                    <div className="LibraryContainer-subHeader-button" onClick={() => {createItem('folder', curId)}}>
                        <h4><Add /></h4>
                        <h4>Folder</h4>
                    </div>
                    <div className="LibraryContainer-subHeader-button" onClick={() => {createItem('playlist', curId)}}>
                        <h4><Add /></h4>
                        <h4>Playlist</h4>
                    </div>
                    <div className="LibraryContainer-subHeader-blockHack"></div>
                </div> :
                <div className="LibraryContainer-subHeader">
                    <AddVideo
                        searchResultIds={searchResultIds}
                        setSearchResultIds={setSearchResultIds}
                        handleAdd={(_, id) => addPlaylistVideo(curId, id)}
                        handleMatchYouTubeURL={id => addPlaylistVideo(curId, id)}
                    />
                </div>
            }
            {isFolder(library, curId) ? 
                <Grid loaded={loaded} /> : 
                searchResultIds.length !== 0 ?
                    <VideoList
                        resetScroll={resetScroll}
                        videoIds={searchResultIds}
                        handleAdd={handleAdd}
                        handleRemove={handleDelete}
                        handleToggle={handleToggle}
                        handleQueue
                    /> :
                    <VideoList
                        resetScroll={resetScroll}
                        videoIds={curPlaylist.videos}
                        handleQueue
                        handleMore
                        handleMove
                        handleDelete={handleDelete}
                        onSortEnd={onSortEnd}
                    />
            }
        </div>
    )
}

export default connect(
    state => ({
        library: state.library
    }),
    dispatch => ({
        createItem: (type, parent) => dispatch(createItem(type, parent)),
        loadItem: id => dispatch(loadItem(id)),
        addPlaylistVideo: (playlistId, videoId) => dispatch(addPlaylistVideo(playlistId, videoId)),
        deletePlaylistVideo: (playlistId, videoId) => dispatch(deletePlaylistVideo(playlistId, videoId)),
        movePlaylistVideo: (playlistId, videoId, index) => dispatch(movePlaylistVideo(playlistId, videoId, index))
    })
)(LibraryContainer)
