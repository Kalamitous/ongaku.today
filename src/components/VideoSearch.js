import React, { useState } from 'react'
import { youtubeConfig } from '../config'

const API_KEY = youtubeConfig.apiKey

const VideoSearchStates = () => {
    const [query, setQuery] = useState('')
    const [curQuery, setCurQuery] = useState() // prevents spamming the same query
    return {
        query: query,
        curQuery: curQuery,
        setQuery: setQuery,
        setCurQuery: setCurQuery
    }
}

const VideoSearch = Component => props => {
    const states = VideoSearchStates()
    const query = states.query
    const curQuery = states.curQuery
    const setQuery = states.setQuery
    const setCurQuery = states.setCurQuery

    const searchResultIds = props.searchResultIds
    const setSearchResultIds = props.setSearchResultIds
    const handleMatchYouTubeURL = props.handleMatchYouTubeURL
    
    const handleSearch = () => {
        if (query !== '' && query !== curQuery) {
            const re = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig
            if (query.match(re)) {
                const id = query.replace(re, '$1')
                if (!id) return
                if (handleMatchYouTubeURL) {
                    handleMatchYouTubeURL(id)
                    return
                }
                setSearchResultIds([id])
                return
            }
            const url = `https://www.googleapis.com/youtube/v3/search?` +
                `part=id` + 
                `&safeSearch=strict` +
                `&maxResults=50` +
                `&videoSyndicated=true` +
                `&videoEmbeddable=true` +
                `&q=${query}` +
                `&type=video` +
                `&fields=items/id/videoId` +
                `&key=${API_KEY}`
            fetch(url)
            .then(response => response.json())
            .then(response => {
                const tempIds = []
                response.items.forEach(item => {
                    tempIds.push(item.id.videoId)
                })
                setSearchResultIds(tempIds)
            })
            setCurQuery(query)
        }
    }

    const handleEnter = event => {
        if (event.keyCode === 13) handleSearch()
    }
    const handleInputChange = event => {
        if (event.target.value === '') {
            setSearchResultIds([])
        } else {
            setQuery(event.target.value)
        }
    }
    
    return (
        <Component
            searchResultIds={searchResultIds}
            setSearchResultIds={setSearchResultIds}
            handleSearch={handleSearch}
            handleInputChange={handleInputChange}
            handleEnter={handleEnter}
            otherProps={props}
        />
    )
}

export default VideoSearch
