import React, { useRef } from 'react'
import VideoSearch from '../../VideoSearch'
import Add from '@material-ui/icons/Add'
import Close from '@material-ui/icons/Close'
import Search from '@material-ui/icons/Search'
import './AddVideo.css'

const AddVideo = props => {
    const searchResultIds = props.searchResultIds
    const setSearchResultIds = props.setSearchResultIds
    const handleSearch = props.handleSearch
    const handleInputChange = props.handleInputChange
    const handleEnter = props.handleEnter

    const ref = useRef()

    const handleClose = () => {
        setSearchResultIds([])
        ref.current.value = ''
    }
    
    return (
        <div className="AddVideo">
            <div className="AddVideo-deck">
                <h4 className={searchResultIds.length === 0 ? "AddVideo-deck-button" : "AddVideo-deck-button close"}>
                    {searchResultIds.length === 0 ? <Add /> : <Close onClick={handleClose} />}
                </h4>
                <input
                    ref={ref}
                    size="1"
                    placeholder="Enter a YouTube link or search"
                    spellCheck="false"
                    className="AddVideo-deck-input"
                    onChange={handleInputChange}
                    onKeyDown={handleEnter}
                />
                <h4 className="AddVideo-deck-button"><Search onClick={handleSearch} /></h4>
            </div>
        </div>
    )
}

export default VideoSearch(AddVideo)
