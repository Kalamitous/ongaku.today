import React, { useState, useLayoutEffect } from 'react'
import { connect } from 'react-redux'
import { closeContext } from '../../../redux/actions/contextActions'
import { retrievePlaylists } from '../../../redux/actions/firebaseActions'
import { createItem, setItemName, addPlaylistBatch } from '../../../redux/actions/libraryActions'
import { get, isFolder } from '../../../util/library'
import Cloud from '@material-ui/icons/Cloud'
import CloudDownload from '@material-ui/icons/CloudDownload'
import VideoLibrary from '@material-ui/icons/VideoLibrary'
import './ImportContext.css'

const ImportContextItem = props => {
    const text = props.text
    const handleClick = props.handleClick
    
    return (
        <div className="ContextMenu-item ImportContext-item" onClick={handleClick}>
            <p><VideoLibrary /></p>
            <p>{text}</p>
            <p><CloudDownload /></p>
        </div>
    )
}

const ImportContext = props => {
    const closeContext = props.closeContext
    const retrievedPlaylists = props.retrievedPlaylists
    const retrievePlaylists = props.retrievePlaylists
    const createItem = props.createItem
    const setItemName = props.setItemName
    const addPlaylistBatch = props.addPlaylistBatch
    const library = props.library
    const curId = library.curId
    
    const [retrieved, setRetrieved] = useState(retrievedPlaylists != null)
    const [playlistItems, setPlaylistItems] = useState([])
    const [message, setMessage] = useState('Loading...')
    
    useLayoutEffect(() => {
        if (!retrievedPlaylists) {
            if (retrieved) {
                setMessage('None found.')
            } else {
                retrievePlaylists(() => setRetrieved(true))
            }
            return
        }
        setMessage(null)
        const temp = []
        retrievedPlaylists.forEach(item => {
            const recursiveRetrieval = (arr, nextPageToken, callback) => {
                if (typeof(nextPageToken) === 'undefined') {
                    callback()
                    return
                }
                let url = `https://www.googleapis.com/youtube/v3/playlistItems?` +
                    `fields=nextPageToken,items(contentDetails(videoId))` +
                    `&part=contentDetails` +
                    `&maxResults=50` +
                    `&playlistId=${item.id}`
                url += nextPageToken !== '' ? `&pageToken=${nextPageToken}` : ''
                window.gapi.client.request({'path': url})
                .then(response => {
                    response.result.items.forEach((item) => {
                        if (item.contentDetails.videoId) arr.push(item.contentDetails.videoId)
                    })
                    recursiveRetrieval(arr, response.result.nextPageToken, callback)
                })
            }
            const handleImport = () => {
                let nextPageToken = ''
                const videoIds = []
                setMessage('Importing...')
                recursiveRetrieval(videoIds, nextPageToken, () => {
                    // create a playlist if we are importing into a folder
                    let playlistId = curId
                    if (isFolder(library, curId)) {
                        createItem('playlist', curId)
                        const playlists = get(library, curId).playlists
                        playlistId = playlists[playlists.length - 1]
                        setItemName(playlistId, item.snippet.title)
                    }
                    addPlaylistBatch(playlistId, videoIds)
                    closeContext()
                })
            }
            temp.push(
                <ImportContextItem
                    key={item.id}
                    id={item.id}
                    text={item.snippet.title}
                    handleClick={handleImport}
                />
            )
        })
        setPlaylistItems(temp)
    }, [
        addPlaylistBatch,
        closeContext,
        createItem,
        curId,
        library,
        retrievePlaylists,
        retrieved,
        retrievedPlaylists,
        setItemName
    ])

    return (
        <div className="ImportContext">
            <div className="ContextMenu-item title">
                <p><Cloud /></p>
                <p>YouTube Playlists</p>
            </div>
            <div className="horizontal-divider" />
            <div className="ContextMenu-marginHackContainer">
                <div className="ContextMenu-body">
                    {message ?
                        <div className="ContextMenu-message">
                            <p>{message}</p>
                        </div> :
                        playlistItems
                    }
                </div>
                {playlistItems.length > 5 ? <div className="ContextMenu-marginHackContainer-marginHack" /> : null}
            </div>
        </div>
    )
}

export default connect(
    state => ({
        retrievedPlaylists: state.firebase.playlists,
        library: state.library
    }),
    dispatch => ({
        closeContext: () => dispatch(closeContext()),
        retrievePlaylists: callback => dispatch(retrievePlaylists(callback)),
        createItem: (type, parent) => dispatch(createItem(type, parent)),
        setItemName: (id, name) => dispatch(setItemName(id, name)),
        addPlaylistBatch: (playlistId, batch) => dispatch(addPlaylistBatch(playlistId, batch))
    })
)(ImportContext)
