import React, { useState, useLayoutEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { playVideo, toggleLoopVideo } from '../../redux/actions/playerActions'
import { videoCache } from '../../util/globals'
import { getNextVideo, getPrevVideo } from '../../util/queue'
import CurrentTime from './CurrentTime'
import ProgressBar from './ProgressBar/ProgressBar'
import VolumeControl from './VolumeControl/VolumeControl'
import Fullscreen from '@material-ui/icons/Fullscreen'
import Pause from '@material-ui/icons/Pause'
import PlayArrow from '@material-ui/icons/PlayArrow'
import Repeat from '@material-ui/icons/Repeat'
import SkipNext from '@material-ui/icons/SkipNext'
import SkipPrevious from '@material-ui/icons/SkipPrevious'
import './ControlDeck.css'

const ControlDeck = props => {
    const player = props.player
    const queue = props.queue
    const playVideoFromId = props.playVideo
    const toggleLoopVideo = props.toggleLoopVideo
    
    const ref = useRef()
    const [title, setTitle] = useState()
    const [duration, setDuration] = useState(0)

    useLayoutEffect(() => {
        if (!player.curId) {
            setTitle()
            return
        }
        if (videoCache[player.curId] && videoCache[player.curId].title) {
            setTitle(videoCache[player.curId].title)
            return
        }
        fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${player.curId}`)
        .then(response => response.json())
        .then(response => setTitle(response.title))
    }, [player.curId])

    useLayoutEffect(() => {
        if (!player.object || player.state === 0) return
        setDuration(player.object.getDuration())
    }, [player.object, player.state, player.curId])

    useLayoutEffect(() => {
        if (ref) ref.current.classList.toggle('active', player.loopVideo)
    }, [player.loopVideo])

    const formatTime = s => {
        if (!s) return '0:00'
        const hours = Math.floor(s / 3600)
        const minutes = Math.floor(s % 3600 / 60)
        const seconds = Math.floor(s % 3600 % 60)
        let formatted = ''
        if (hours > 0) formatted += hours + ':'
        formatted += minutes + ':' + ('0' + seconds).slice(-2)
        return formatted
    }
    const playVideo = () => {
        if (player.object && player.curId !== null) player.object.playVideo()
    }
    const pauseVideo = () => {
        if (player.object) player.object.pauseVideo()
    }
    const handleFullscreen = () => {
        if (!player.curId) return
        document.querySelector('.VideoContainer').requestFullscreen()
    }
    
    return (
        <div className="ControlDeck">
            {title ?
                <div className="ControlDeck-header">
                    <CurrentTime className="ControlDeck-header-left" playerObject={player.object} formatTime={formatTime} />
                    <h5 className="ControlDeck-header-center">{title}</h5>
                    <p className="ControlDeck-header-right">{player.object ? formatTime(duration) : null}</p>
                </div> :
                <div className="ControlDeck-header">&nbsp;</div>
            }
            <ProgressBar
                curPlayerId={player.curId}
                playerObject={player.object}
                playerState={player.state}
                duration={duration}
            />
            <div className="ControlDeck-footer">
                <div className="ControlDeck-footer-left">
                    <VolumeControl playerObject={player.object} />
                </div>
                <div className="ControlDeck-footer-center">
                    <h5><SkipPrevious onClick={() => playVideoFromId(getPrevVideo(player.loopPlaylist, queue))} /></h5>
                    <h5>
                        {player.state !== 1 ? <PlayArrow onClick={playVideo} /> : <Pause onClick={pauseVideo} />}
                    </h5>
                    <h5><SkipNext onClick={() => playVideoFromId(getNextVideo(player.loopPlaylist, queue))} /></h5>
                </div>
                <div className="ControlDeck-footer-right">
                    <h5><Repeat onClick={toggleLoopVideo} ref={ref} /></h5>
                    <h5><Fullscreen onClick={handleFullscreen} /></h5>
                </div>
            </div>
        </div>
    )
}

export default connect(
    state => ({
        player: state.player,
        queue: state.queue
    }),
    dispatch => ({
        playVideo: id => dispatch(playVideo(id)),
        toggleLoopVideo: () => dispatch(toggleLoopVideo())
    })
)(ControlDeck)
