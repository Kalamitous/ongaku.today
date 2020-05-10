import React from 'react'
import { connect } from 'react-redux'
import { moveItem } from '../../../redux/actions/libraryActions'
import { get, getName } from '../../../util/library'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import GridItem from '../GridItem/GridItem'
import './Grid.css'

const Element = SortableElement(({id, library, type}) =>
    <GridItem id={id} name={getName(library, id)} type={type} />
)

const Container = SortableContainer(({items, library, type}) =>
    <div className="Grid-body">
        {items.map((id, index) => {
            if (get(library, id)) { 
                return <Element key={id} id={id} library={library} index={index} type={type} />
            }
            return null
        })}
    </div>
)

const Grid = props => {
    const library = props.library
    const moveItem = props.moveItem

    const curFolder = get(library, library.curId)
    
    const onSortStart = () => {
        const grids = document.querySelectorAll('.Grid-body')
        grids.forEach(grid => { grid.style.pointerEvents = 'none' }) // hack to prevent hover styling on PlaylistItem when dragging
        document.body.style.cursor = 'grabbing'
    }
    const onFolderSortEnd = ({oldIndex, newIndex}) => {
        const grids = document.querySelectorAll('.Grid-body')
        grids.forEach(grid => { grid.style.pointerEvents = 'auto' })
        document.body.style.cursor = 'default'
        const id = curFolder.folders[oldIndex]
        moveItem(id, newIndex, 'folder')
    }
    const onPlaylistSortEnd = ({oldIndex, newIndex}) => {
        const grids = document.querySelectorAll('.Grid-body')
        grids.forEach(grid => { grid.style.pointerEvents = 'auto' })
        document.body.style.cursor = 'default'
        const id = curFolder.playlists[oldIndex]
        moveItem(id, newIndex, 'playlist')
    }

    return (
        <div className="Grid">
            {curFolder.folders.length > 0 ? 
                <Container
                    type="FolderItem"
                    items={curFolder.folders}
                    library={library}
                    axis="xy"
                    helperClass="drag"
                    onSortStart={onSortStart}
                    onSortEnd={onFolderSortEnd}
                    useDragHandle
                    getContainer={() => document.querySelector(".Grid")}
                /> :
                null
            }
            <Container
                type="PlaylistItem"
                items={curFolder.playlists}
                library={library}
                axis="xy"
                helperClass="drag"
                onSortStart={onSortStart}
                onSortEnd={onPlaylistSortEnd}
                useDragHandle
                getContainer={() => document.querySelector(".Grid")}
            />
        </div>
    )
}

export default connect(
    state => ({
        library: state.library
    }),
    dispatch => ({
        moveItem: (id, index) => dispatch(moveItem(id, index))
    })
)(Grid)
