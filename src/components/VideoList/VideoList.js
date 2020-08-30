import React, { useState, useLayoutEffect } from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { AutoSizer, List } from 'react-virtualized'
import VideoItem from '../VideoItem/VideoItem'
import './VideoList.css'

const Item = SortableElement(({ id, props }) =>
    <VideoItem
        id={id}
        active={id === props.activeId}
        draggable={props.onSortEnd !== undefined}
        handleAdd={props.handleAdd}
        handleRemove={props.handleRemove}
        handleToggle={props.handleToggle}
        handleQueue={props.handleQueue}
        handleMore={props.handleMore}
        handleMove={props.handleMove}
        handleDelete={props.handleDelete}
    />
)

const ItemList = SortableContainer(({ props }) => {
    const resetScroll = props.resetScroll
    const videoIds = props.videoIds
    const draggable = props.onSortEnd !== undefined

    const [rowHeight, setRowHeight] = useState(0)

    useLayoutEffect(() => {
        const updateRowHeight = () => {
            const div = document.createElement('div')
            div.className = 'VideoItem-body-info'
            div.innerHTML =
                '<div className="VideoItem-body-info-title"><p>&nbsp;</p></div>' +
                '<div className="VideoItem-body-info-author"><p>&nbsp;</p></div>'
            document.body.append(div)
            setRowHeight(div.offsetHeight)
            div.remove()
        }
        updateRowHeight()
        window.addEventListener('resize', updateRowHeight)
        return () => window.removeEventListener('resize', updateRowHeight)
    }, [])

    const rowRenderer = ({ index, style }) => {
        const id = videoIds[index]
        return (
            <div className="VideoList-item" key={id} style={style}>
                <Item index={index} id={id} props={props} disabled={!draggable} />
            </div>
        )
    }

    return (
        <div className="VideoList">
            <AutoSizer>
                {({ width, height }) => {
                    if (resetScroll) {
                        return (
                            <List
                                scrollTop={0}
                                className="VideoList-list"
                                width={width}
                                height={height}
                                rowCount={videoIds.length}
                                rowHeight={rowHeight}
                                rowRenderer={rowRenderer}
                                overscanRowCount={16}
                            />
                        )
                    } else {
                        return (
                            <List
                                className="VideoList-list"
                                width={width}
                                height={height}
                                rowCount={videoIds.length}
                                rowHeight={rowHeight}
                                rowRenderer={rowRenderer}
                                overscanRowCount={16}
                            />
                        )
                    }
                }}
            </AutoSizer>
        </div>
    )
})

const VideoList = props => {
    const onSortStart = () => {
        document.body.style.cursor = 'row-resize'
    }
    const onSortEnd = ({ oldIndex, newIndex }) => {
        document.body.style.cursor = 'default'
        props.onSortEnd(oldIndex, newIndex)
    }

    return (
        <ItemList
            props={props}
            helperClass="drag"
            onSortStart={onSortStart}
            onSortEnd={onSortEnd}
            getContainer={() => document.querySelector('.VideoList-list')}
            useDragHandle
        />
    )
}

export default VideoList
