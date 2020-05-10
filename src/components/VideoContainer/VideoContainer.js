import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { setPlayer, setPlayerState, playVideo, cueVideo } from '../../redux/actions/playerActions'
import { getNextVideo } from '../../util/queue'
import './VideoContainer.css'

const VideoContainer = props => {
    const state = props.state
    const curId = props.curId
    const loopVideo = props.loopVideo
    const loopPlaylist = props.loopPlaylist
    const queue = props.queue
    const setPlayer = props.setPlayer
    const setPlayerState = props.setPlayerState
    const playVideo = props.playVideo
    const cueVideo = props.cueVideo

    const ref = useRef()
    const [error, setError] = useState(false)

    // iframe api setup
    useLayoutEffect(() => {
        if (window.YT) return
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        document.getElementsByTagName('head')[0].appendChild(script)
        window.onYouTubeIframeAPIReady = () => {
            new window.YT.Player('VideoContainer-player', {
                events: {
                    'onReady': event => {
                        setPlayer(event.target)
                        const initId = localStorage.getItem('id')
                        if (initId) cueVideo(initId)
                    },
                    'onStateChange': event => setPlayerState(event.data),
                    'onError': () => setError(true)
                }
            })
        }
        return () => window.YT = null
    }, [curId, setPlayer, setPlayerState, cueVideo])

    useEffect(() => {
        setError(false)
        if (!error) {
            if (state !== 0) return
            if (loopVideo) {
                playVideo(curId)
                return
            }
        }
        const nextId = getNextVideo(loopPlaylist, queue)
        if (nextId !== curId) {
            playVideo(nextId)
        } else if (loopPlaylist && queue.ids.length === 1) {
            playVideo(nextId)
        } else {
            cueVideo(nextId)
        }
    // eslint-disable-next-line
    }, [state])
    
    return (
        <div className="VideoContainer" ref={ref}>
            <iframe
                id="VideoContainer-player"
                src="https://www.youtube.com/embed/?modestbranding=1&rel=0&controls=0&enablejsapi=1"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen="1"
                title="YouTube Player"
                style={{visibility: curId ? 'visible' : 'hidden'}}
            />
        </div>
    )
}

export default connect(
    state => ({
        state: state.player.state,
        curId: state.player.curId,
        loopVideo: state.player.loopVideo,
        loopPlaylist: state.player.loopPlaylist,
        queue: state.queue
    }),
    dispatch => ({
        setPlayer: object => dispatch(setPlayer(object)),
        setPlayerState: state => dispatch(setPlayerState(state)),
        playVideo: id => dispatch(playVideo(id)),
        cueVideo: id => dispatch(cueVideo(id))
    })
)(VideoContainer)
