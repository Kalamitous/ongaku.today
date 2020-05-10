import React, { useState, useLayoutEffect } from 'react'
import { connect } from 'react-redux'
import { signIn } from '../../redux/actions/firebaseActions'
import { initLibrary } from '../../redux/actions/libraryActions'
import { Link } from 'react-router-dom'
import './LandingView.css'

const LandingView = props => {
    const signIn = props.signIn
    const initLibrary = props.initLibrary
    const setLoaded = props.setLoaded

    const [signedIn, setSignedIn] = useState(false)

    useLayoutEffect(() => {
        if (!document.getElementById('LandingView-container-button')) {
            return
        }
        const script = document.createElement('script')
        script.src = 'https://apis.google.com/js/platform.js?onload=renderButton'
        script.onload = () => {
            window.gapi.signin2.render('LandingView-container-button', {
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
                <div className="LandingView-container">
                    <h1 className="LandingView-container-title">ongaku<span>.today</span></h1>
                    <h3 className="LandingView-container-caption">A robust playlist manager for YouTube.</h3>
                    <div id="LandingView-container-button" />
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
