import React, { useState, useLayoutEffect } from 'react'
import { connect } from 'react-redux'
import { retrievePlaylists } from '../../../redux/actions/firebaseActions'
import { closeContext } from '../../../redux/actions/contextActions'
import { addPlaylistBatch } from '../../../redux/actions/libraryActions'
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
    const retrievedPlaylists = props.retrievedPlaylists
    const curId = props.curId
    const retrievePlaylists = props.retrievePlaylists
    const closeContext = props.closeContext
    const addPlaylistBatch = props.addPlaylistBatch
    
    const [retrieved, setRetrieved] = useState(false)
    const [playlistItems, setPlaylistItems] = useState([
        <div className="ContextMenu-message" key="loading">
            <p>Loading...</p>
        </div>
    ])
    
    useLayoutEffect(() => {
        if (!retrieved) {
            retrievePlaylists(() => setRetrieved(true))
            return
        }
        if (!retrievedPlaylists) {
            setPlaylistItems([
                <div className="ContextMenu-message" key="loading">
                    <p>None found.</p>
                </div>
            ])
            return
        }
        const temp = []
        retrievedPlaylists.forEach((item) => {
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
                recursiveRetrieval(videoIds, nextPageToken, () => {
                    closeContext()
                    addPlaylistBatch(curId, videoIds)
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
    }, [retrieved, retrievedPlaylists, closeContext, retrievePlaylists, addPlaylistBatch, curId])

    return (
        <div className="ImportContext">
            <div className="ContextMenu-item title">
                <p><Cloud /></p>
                <p>YouTube Playlists</p>
            </div>
            <div className="divider" />
            <div className="ContextMenu-marginHackContainer">
                <div className="ContextMenu-body">
                    {playlistItems}
                </div>
                {playlistItems.length > 5 ? <div className="ContextMenu-marginHackContainer-marginHack" /> : null}
            </div>
        </div>
    )
}

export default connect(
    state => ({
        retrievedPlaylists: state.firebase.playlists,
        curId: state.library.curId
    }),
    dispatch => ({
        closeContext: () => dispatch(closeContext()),
        retrievePlaylists: (callback) => dispatch(retrievePlaylists(callback)),
        addPlaylistBatch: (playlistId, batch) => dispatch(addPlaylistBatch(playlistId, batch))
    })
)(ImportContext)
