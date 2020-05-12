import React from 'react'
import ControlDeck from '../ControlDeck/ControlDeck'
import VideoContainer from '../VideoContainer/VideoContainer'
import QueueBar from '../QueueBar/QueueBar'
import './RightPane.css'

const RightPane = () => (
    <div className="RightPane">
        <VideoContainer />
        <ControlDeck />
        <div className="horizontal-divider" />
        <QueueBar />
    </div>
)

export default RightPane
