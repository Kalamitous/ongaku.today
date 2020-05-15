import React, { useState, useLayoutEffect } from 'react'
import { connect } from 'react-redux'
import { initAuth } from '../../redux/actions/firebaseActions'
import { initLibrary } from '../../redux/actions/libraryActions'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import LandingView from '../LandingView/LandingView'
import LeftPane from '../LeftPane/LeftPane'
import Privacy from '../Privacy'
import RightPane from '../RightPane/RightPane'
import './App.css'

const App = props => {
    const isSignedIn = props.isSignedIn
    const initAuth = props.initAuth
    const initLibrary = props.initLibrary

    const [loaded, setLoaded] = useState(false)

    useLayoutEffect(() => {
        const theme = localStorage.getItem('theme')
        if (theme) document.querySelector('body').classList.add(theme)
    }, [])

    useLayoutEffect(() => {
        setLoaded(false) // reset load state on sign-out
        const script = document.createElement('script')
        script.src = 'https://apis.google.com/js/api.js'
        script.onload = () => {
            window.gapi.load('client', () => {
                initAuth().then(() => {
                    if (!isSignedIn) return
                    initLibrary().then(() => setLoaded(true))
                })
            })
        }
        document.getElementsByTagName('head')[0].appendChild(script) 
    }, [isSignedIn, initAuth, initLibrary])

  	return (
        <BrowserRouter>
            <Switch>
                <Route path="/privacy">
                    <Privacy />
                </Route>
                <Route path="/">
                    {isSignedIn === false ? <LandingView setLoaded={setLoaded} /> :
                        loaded ?
                            <div className="App">
                                <LeftPane />
                                <RightPane />
                            </div> :
                            null
                    }
                </Route>
            </Switch>
        </BrowserRouter>
  	)
}

export default connect(
    state => ({
        isSignedIn: state.firebase.isSignedIn
    }),
    dispatch => ({
        initAuth: () => dispatch(initAuth()),
        initLibrary: () => dispatch(initLibrary())
    })
)(App)
