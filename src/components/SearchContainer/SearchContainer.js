import React from 'react'
import { connect } from 'react-redux'
import { openContext } from '../../redux/actions/contextActions'
import { addPlaylistVideo } from '../../redux/actions/libraryActions'
import MoveContext from '../ContextMenu/MoveContext/MoveContext'
import VideoList from '../VideoList/VideoList'
import VideoSearch from '../VideoSearch'
import Search from '@material-ui/icons/Search'
import './SearchContainer.css'

const SearchContainer = props => {
    const openContext = props.otherProps.openContext
    const addPlaylistVideo = props.otherProps.addPlaylistVideo
    const searchResultIds = props.searchResultIds
    const handleSearch = props.handleSearch
    const handleInputChange = props.handleInputChange
    const handleEnter = props.handleEnter

    const handleAdd = (id, event) => {
        openContext(
            event, 
            <MoveContext
                id={id}
                contextAction={(playlistId) => addPlaylistVideo(playlistId, id)} 
                videoMode
            />
        )
    }

    return (
        <div className="SearchContainer">
            <div className="SearchContainer-search">
                <div className="SearchContainer-search-bar">
                    <input
                        size="1"
                        placeholder="Enter a YouTube link or search"
                        spellCheck="false"
                        className="SearchContainer-search-bar-input"
                        onChange={handleInputChange} 
                        onKeyDown={handleEnter}
                    />
                    <h4><Search className="SearchContainer-search-bar-button" onClick={handleSearch} /></h4>
                </div>
            </div>
            <div className="SearchContainer-results">
                <VideoList
                    videoIds={searchResultIds}
                    handleAdd={handleAdd}
                    handleQueue
                />
            </div>
        </div>
    )
}

export default connect(
    null,
    dispatch => ({
        openContext: (event, component) => dispatch(openContext(event, component)),
        addPlaylistVideo: (playlistId, videoId) => dispatch(addPlaylistVideo(playlistId, videoId))
    })
)(VideoSearch(SearchContainer))
