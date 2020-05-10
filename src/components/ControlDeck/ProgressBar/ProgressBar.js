import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import './ProgressBar.css'

const ProgressBar = props => {
    const curPlayerId = props.curPlayerId
    const playerObject = props.playerObject
    const playerState = props.playerState
    const duration = props.duration

    const ref = useRef()
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            if (playerObject && playerState === 1) { // relieve control to user when scrubbing
                setProgress(playerObject.getCurrentTime() / duration)
            }
        }, 100)
        return () => clearInterval(timer)
    })

    useLayoutEffect(() => {
        ref.current.style.visibility = curPlayerId ? 'visible' : 'hidden'
        setProgress(0)
    }, [curPlayerId])

    const handleChange = event => {
        if (playerObject) playerObject.seekTo(duration * event.target.value, true)
        setProgress(event.target.value)
    }

    return (
        <div className="ProgressBar">
            <div style={{ width: `${progress * 100}%` }} ref={ref}></div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                className="ProgressBar-slider"
                value={progress}
                onChange={handleChange}
            />
        </div>
    )
}

export default ProgressBar
