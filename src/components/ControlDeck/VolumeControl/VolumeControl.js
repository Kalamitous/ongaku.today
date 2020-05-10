import React, { useState, useEffect } from 'react'
import VolumeUp from '@material-ui/icons/VolumeUp'
import VolumeDown from '@material-ui/icons/VolumeDown'
import VolumeOff from '@material-ui/icons/VolumeOff'
import './VolumeControl.css'

const VolumeControl = props => {
    const playerObject = props.playerObject

    const [volume, setVolume] = useState(localStorage.getItem('volume') || 50)
    // for custom mute implementation
    const [previousVolume, setPreviousVolume] = useState(localStorage.getItem('volume') || 50)

    useEffect(() => {
        if (playerObject) {
            playerObject.setVolume(volume)
            localStorage.setItem('volume', volume)
        }
    }, [playerObject, volume])

    const changeVolume = event => {
        if (playerObject) playerObject.setVolume(event.target.value)
        setVolume(event.target.value)
    }
    const unmute = () => {
        playerObject.setVolume(previousVolume)
        setVolume(previousVolume)
    }
    const mute = () => {
        if (volume > 0) setPreviousVolume(volume)
        if (playerObject) playerObject.setVolume(0) // user could click on VolumeUp before the player has loaded
        setVolume(0)
    }
    
    return (
        <div className="VolumeControl">
            <h5>
                {playerObject && Number(volume) === 0 ? // convert to Number just to not piss off linter lol
                    <VolumeOff onClick={unmute} /> :
                    playerObject && volume < 50 ?
                        <VolumeDown style={{ position: "relative", left: "-2px" }} onClick={mute} /> :
                        <VolumeUp onClick={mute} />
                }
            </h5>
            <div className="VolumeControl-bar">
                <input
                    type="range"
                    min="0"
                    max="100"
                    className="VolumeControl-bar-slider"
                    value={volume}
                    onChange={changeVolume}
                />
            </div>
        </div>
    )
}

export default VolumeControl
