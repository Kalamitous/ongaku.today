import React from 'react'
import { connect } from 'react-redux'
import { openContext } from '../../redux/actions/contextActions'
import { addPlaylistVideo, deletePlaylistVideo } from '../../redux/actions/libraryActions'
import { playVideo } from '../../redux/actions/playerActions'
import { addToQueue } from '../../redux/actions/queueActions'
import { SortableHandle } from 'react-sortable-hoc'
import DragIndicator from '@material-ui/icons/DragIndicator'
import MoveContext from '../ContextMenu/MoveContext/MoveContext'
import MoreContext from '../ContextMenu/MoreContext'
import Add from '@material-ui/icons/Add'
import MoreHoriz from '@material-ui/icons/MoreHoriz'
import PlayArrow from '@material-ui/icons/PlayArrow'
import PlaylistAdd from '@material-ui/icons/PlaylistAdd'
import Remove from '@material-ui/icons/Remove'
import './ActionButtons.css'

const DragHandle = SortableHandle(() => <DragIndicator />)

const ActionButtons = props => {
    const curPlaylist = props.curPlaylist
    const openContext = props.openContext
    const addPlaylistVideo = props.addPlaylistVideo
    const deletePlaylistVideo = props.deletePlaylistVideo
    const playVideo = props.playVideo
    const addToQueue = props.addToQueue
    const id = props.id

    const handleAdd = event => props.handleAdd(id, event)
    const handleQueue = () => addToQueue([id])
    const handleRemove = () => props.handleRemove(id)
    const handleDelete = () => props.handleDelete(id)
    const handleMore = event => {
        const handleMove = event => {
            const contextAction = newPlaylist => {
                if (curPlaylist === newPlaylist) return
                deletePlaylistVideo(curPlaylist, id)
                addPlaylistVideo(newPlaylist, id)
            }
            return () => {
                openContext(
                    event,
                    <MoveContext
                        id={curPlaylist}
                        contextAction={contextAction}
                        videoMode
                    />
                )
            }
        }
        openContext(
            event,
            <MoreContext
                handleMove={handleMove({ clientX: event.clientX, clientY: event.clientY })}
                handleDelete={handleDelete}
                deleteText="Remove"
            />
        )
    }

    return (
        <div className="ActionButtons"> 
            <h5>
                {props.handleToggle ? 
                    props.handleToggle(id) ? <Add onClick={handleAdd} /> : <Remove onClick={handleRemove} /> :
                    props.handleAdd ? <Add onClick={handleAdd} /> : null
                }
            </h5>
            <h5><PlayArrow onClick={() => playVideo(id)} /></h5>
            <h5>{props.handleQueue ? <PlaylistAdd onClick={handleQueue} /> : null}</h5>
            <h5>
                {props.handleMore ? 
                    <MoreHoriz onClick={handleMore} /> :
                    props.handleRemove ? <Remove onClick={handleRemove} /> : null
                }
            </h5>
            <h4 className="ActionButtons-dragHandle">{props.draggable ? <DragHandle /> : null}</h4>
        </div>
    )
}

export default connect(
    state => ({
        curPlaylist: state.library.curId
    }),
    dispatch => ({
        openContext: (event, component) => dispatch(openContext(event, component)),
        addPlaylistVideo: (playlistId, videoId) => dispatch(addPlaylistVideo(playlistId, videoId)),
        deletePlaylistVideo: (playlistId, videoId) => dispatch(deletePlaylistVideo(playlistId, videoId)),
        playVideo: id => dispatch(playVideo(id)),
        addToQueue: ids => dispatch(addToQueue(ids))
    })
)(ActionButtons)
