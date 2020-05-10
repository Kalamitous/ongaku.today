import React from 'react'
import { Link } from 'react-router-dom'
import KeyboardReturn from '@material-ui/icons/KeyboardReturn'

const Privacy = () => (
    <div className="Page">
        <h2>Privacy Policy</h2>
        <br />
        <br />
        <h5>
            <b>ongaku.today</b> will be able to see your name and email upon sign-in.
            Only your email will be collected to serve as a method of identifying you.
        </h5>
        <br />
        <h5>
            To be able to import playlists from YouTube, <b>ongaku.today</b> will ask for permission to view your YouTube account.
            You can choose to deny this request at the cost of not being able to use the importing feature.
        </h5>
        <br />
        <h5>
            The folders and playlists you create and the videos you add on <b>ongaku.today</b> will be saved on our systems.
        </h5>
        <br />
        <br />
        <Link to="/"><h2><KeyboardReturn /></h2></Link>
    </div>
)

export default Privacy
