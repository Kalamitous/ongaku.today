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
                {searchResultIds.length === 0 ? 
                    <h4 className="AddVideo-deck-button"><Add /></h4> :
                    <h4 title="Close search" className="AddVideo-deck-button close">
                        <Close onClick={handleClose} />
                    </h4>
                }
                <input
                    ref={ref}
                    size="1"
                    placeholder="Enter a YouTube link or search"
                    spellCheck="false"
                    className="AddVideo-deck-input"
                    onChange={handleInputChange}
                    onKeyDown={handleEnter}
                />
                <h4 title="Search" className="AddVideo-deck-button">
                    <Search onClick={handleSearch} />
                </h4>
            </div>
        </div>
    )
}

export default VideoSearch(AddVideo)
