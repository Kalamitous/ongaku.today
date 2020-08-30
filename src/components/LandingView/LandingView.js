import React, { useState, useLayoutEffect } from 'react'
import { connect } from 'react-redux'
import { signIn } from '../../redux/actions/firebaseActions'
import { initLibrary } from '../../redux/actions/libraryActions'
import { Link } from 'react-router-dom'
import ExpandMore from '@material-ui/icons/ExpandMore'
import './LandingView.css'

const LandingView = props => {
    const signIn = props.signIn
    const initLibrary = props.initLibrary
    const setLoaded = props.setLoaded

    const [signedIn, setSignedIn] = useState(false)

    useLayoutEffect(() => {
        if (!document.getElementById('LandingView-signin-button')) {
            return
        }
        const script = document.createElement('script')
        script.src = 'https://apis.google.com/js/platform.js?onload=renderButton'
        script.onload = () => {
            window.gapi.signin2.render('LandingView-signin-button', {
                'width': 240,
                'height': 50,
                'longtitle': true,
                'theme': 'light',
                'onsuccess': googleUser => {
                    setSignedIn(true)
                    signIn(googleUser)
                    .then(() => initLibrary())
                    .then(() => setLoaded(true))
                },
            })
        }
        document.getElementsByTagName('head')[0].appendChild(script)
    })

    return (
        !signedIn ?
            <div className="Page LandingView">
                <div className="LandingView-signin">
                    <h1 className="LandingView-signin-title">ongaku<span>.today</span></h1>
                    <h3 className="LandingView-signin-caption">A robust playlist manager for YouTube.</h3>
                    <div id="LandingView-signin-button" />
                    <div className="LandingView-scroll">
                        <h4>Scroll for more</h4>
                        <h3><ExpandMore /></h3>
                    </div>
                </div>
                <div className="LandingView-transition" />
                <div className="LandingView-info">
                    <h2>About</h2>
                    <br />
                    <div className="horizontal-divider" />
                    <div className="LandingView-info-image"><img src="landing-1.png" alt="Screenshot" /></div>
                    <div className="horizontal-divider" />
                    <br />
                    <h4>
                        <b>ongaku.today</b> makes using YouTube as a music streaming platform easier.
                        With YouTube, videos can only be organized into playlists.
                        <b> ongaku.today</b> takes this one step further and lets you to organize playlists into folders.
                        This nested structure of folders and playlists not only helps you keep track of videos better,
                        but also plays well with our queueing system.
                        <b> ongaku.today</b> allows you to mix and match individual videos, playlists, or folders to be added to the queue.
                        You will always have full control over what is playing.
                    </h4>
                </div>
                <div className="LandingView-info">
                    <h2>Other Features</h2>
                    <br />
                    <div className="horizontal-divider" />
                    <div className="LandingView-info-image"><img src="landing-2.png" alt="Screenshot" /></div>
                    <div className="horizontal-divider" />
                    <br />
                    <h4>
                        For convenience, <b>ongaku.today</b> has integrated YouTube search and playlist importing functionality.
                        Night mode can be toggled for your preferred viewing experience.
                        <b> ongaku.today</b> is still early in development with many new features being planned.
                    </h4>
                </div>
                <div className="LandingView-privacy">
                    <Link to="/privacy"><p>Privacy Policy</p></Link>
                </div>
            </div> :
            null
    )
}

export default connect(
    null,
    dispatch => ({
        signIn: googleUser => dispatch(signIn(googleUser)),
        initLibrary: () => dispatch(initLibrary()),
    })
)(LandingView)
