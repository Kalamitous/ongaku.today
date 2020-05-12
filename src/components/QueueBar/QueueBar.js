import React, { useState, useLayoutEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { toggleLoopPlaylist } from '../../redux/actions/playerActions'
import { removeFromQueue, moveInQueue, shuffleQueue, clearQueue } from '../../redux/actions/queueActions'
import VideoList from '../VideoList/VideoList'
import Delete from '@material-ui/icons/Delete'
import Repeat from '@material-ui/icons/Repeat'
import Shuffle from '@material-ui/icons/Shuffle'
import './QueueBar.css'

const QueueBar = props => {
    const loopPlaylist = props.loopPlaylist
    const queue = props.queue
    const toggleLoopPlaylist = props.toggleLoopPlaylist
    const removeFromQueue = props.removeFromQueue
    const moveInQueue = props.moveInQueue
    const shuffleQueue = props.shuffleQueue
    const clearQueue = props.clearQueue

    const loopRef = useRef()
    const scrollRef = useRef()
    const [prevIndex, setPrevIndex] = useState(queue.curIndex)
    const [rowHeight, setRowHeight] = useState(0)

    useLayoutEffect(() => {
        const updateRowHeight = () => {
            const div = document.createElement('div')
            div.className = 'VideoItem-body-info'
            div.innerHTML =
                '<div className="VideoItem-body-info-title"><p>a</p></div>' +
                '<div className="VideoItem-body-info-author"><p>a</p></div>'
            document.body.append(div)
            setRowHeight(div.offsetHeight)
            div.remove()
        }
        updateRowHeight()
        window.addEventListener('resize', updateRowHeight)
        return () => window.removeEventListener('resize', updateRowHeight)
    }, [])
    
    useLayoutEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.children[0].children[0].children[0]
            const scrollPos = rowHeight * queue.curIndex
            if (scrollPos >= scrollContainer.scrollTop - rowHeight
                && scrollPos < scrollContainer.scrollTop + scrollContainer.offsetHeight) {
                scrollContainer.scrollTo({top: scrollPos, behavior: 'smooth'})
            } else {
                scrollContainer.scrollTo({top: scrollPos, behavior: 'auto'})
            }
        }
        setPrevIndex(queue.curIndex)
    }, [queue.curIndex, prevIndex, rowHeight])

    useLayoutEffect(() => {
        if (loopRef) loopRef.current.classList.toggle('active', loopPlaylist)
    }, [loopPlaylist])
    
    const onSortEnd = (oldIndex, newIndex) => {
        const id = queue.ids[oldIndex]
        moveInQueue(id, newIndex)
    }
    
    return (
        <div className="QueueBar">
            <div className="QueueBar-header">
                {queue.ids.length ? <h5>Queue ({queue.curIndex + 1} / {queue.ids.length})</h5> : <h5>Queue</h5>}
                <div className="QueueBar-header-right">
                    <div className="QueueBar-header-buttons">
                        <h5 title="Shuffle play"><Shuffle onClick={shuffleQueue} /></h5>
                        <h5 title="Loop queue"><Repeat onClick={toggleLoopPlaylist} ref={loopRef} /></h5>
                        <h5 title="Clear queue"><Delete onClick={clearQueue} /></h5>
                    </div>
                </div>
            </div>
            <div className="QueueBar-body" ref={scrollRef}>
                <VideoList
                    videoIds={queue.ids}
                    activeId={queue.ids[queue.curIndex]}
                    handleRemove={removeFromQueue}
                    onSortEnd={onSortEnd}
                />
            </div>
        </div>
    )
}

export default connect(
    state => ({
        loopPlaylist: state.player.loopPlaylist,
        queue: state.queue
    }),
    dispatch => ({
        toggleLoopPlaylist: () => dispatch(toggleLoopPlaylist()),
        removeFromQueue: id => dispatch(removeFromQueue(id)),
        moveInQueue: (id, index) => dispatch(moveInQueue(id, index)),
        shuffleQueue: () => dispatch(shuffleQueue()),
        clearQueue: () => dispatch(clearQueue())
    })
)(QueueBar)
