import React, { useState, useLayoutEffect } from 'react'
import { videoCache } from '../../util/globals'
import ActionButtons from '../ActionButtons/ActionButtons'
import './VideoItem.css'

const VideoItem = props => {
    const id = props.id
    const active = props.active

    const [title, setTitle] = useState()
    const [author, setAuthor] = useState()

    useLayoutEffect(() => {
        let mounted = true
        if (videoCache[id] && videoCache[id].title) {
            setTitle(videoCache[id].title)
            setAuthor(videoCache[id].author)
        } else {
            videoCache[id] = { title: null, author: null }
            fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
            .then(response => {
                if (!mounted) return
                return response.json()
            }).then(response => {
                if (!mounted) return
                setTitle(response.title || 'Video unavailable')
                setAuthor(response.author_name || 'ID: ' + id)
                videoCache[id] = { title: response.title, author: response.author_name }
            })
        }
        return () => mounted = false
    }, [id])

    return (
        <div className={!active ? "VideoItem" : "VideoItem active"} id={id}>
            <div className="VideoItem-thumbnail">
                <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" />
            </div>
            <div className="VideoItem-body">
                <div className="VideoItem-body-info">
                    <div className="VideoItem-body-info-title"><p>{title}</p></div>
                    <div className="VideoItem-body-info-author"><p>{author}</p></div>
                </div>
                <ActionButtons className="VideoItem-body-info-buttons"
                    id={id}
                    draggable={props.draggable}
                    handleAdd={props.handleAdd}
                    handleRemove={props.handleRemove}
                    handleToggle={props.handleToggle}
                    handlePlay={props.handlePlay}
                    handleQueue={props.handleQueue}
                    handleMore={props.handleMore}
                    handleMove={props.handleMove}
                    handleDelete={props.handleDelete}
                />
            </div>
        </div>
    )
}

export default VideoItem
