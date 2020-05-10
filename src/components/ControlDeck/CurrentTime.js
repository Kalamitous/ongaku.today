import React, { useState, useEffect } from 'react'

const CurrentTime = props => {
    const className = props.className
    const playerObject = props.playerObject
    const formatTime = props.formatTime

    const [currentTime, setCurrentTime] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            if (playerObject) setCurrentTime(playerObject.getCurrentTime())
        }, 100)
        return () => clearInterval(timer)
    }, [playerObject])

    return (
        <div className={className}>
            <p>{formatTime(currentTime)}</p>
        </div>
    )
}

export default CurrentTime
