import React, { useState } from 'react'
import { connect } from 'react-redux'
import { signOut } from '../../redux/actions/firebaseActions'
import { setItemView } from '../../redux/actions/libraryActions'
import ContextMenu from '../ContextMenu/ContextMenu'
import LibraryContainer from '../LibraryContainer/LibraryContainer'
import SearchContainer from '../SearchContainer/SearchContainer'
import BrightnessMedium from '@material-ui/icons/BrightnessMedium'
import ExitToApp from '@material-ui/icons/ExitToApp'
import Home from '@material-ui/icons/Home'
import Search from '@material-ui/icons/Search'
import './LeftPane.css'

const LeftPane = props => {
    const signOut = props.signOut
    const setItemView = props.setItemView

    const [active, setActive] = useState(1)
    const [searchResultIds, setSearchResultIds] = useState([])

    // return to Home if already in library view
    const libraryClick = () => active === 1 ? setItemView('0') : setActive(1)
    const searchClick = () => setActive(2)
    const themeClick = () => {
        const body = document.querySelector('body')
        body.classList.toggle('dark-mode')
        localStorage.setItem('theme', body.classList.value)
    }

    return (
        <div className="LeftPane">
            <div className="LeftPane-menu">
                <div className="LeftPane-menu-button" onClick={libraryClick}>
                    <h3><Home /></h3>
                </div>
                <div className="LeftPane-menu-button" onClick={searchClick}>
                    <h3><Search /></h3>
                </div>
                <div className="LeftPane-menu-button" onClick={themeClick}>
                    <h3><BrightnessMedium /></h3>
                </div>
                <div className="LeftPane-menu-button" onClick={signOut}>
                    <h3 className="sign-out"><ExitToApp /></h3>
                </div>
            </div>
            <div className="LeftPane-container">
                <div className="LeftPane-container-header">
                    {active === 1 ? <h2>Library</h2> : null}
                    {active === 2 ? <h2>Search</h2> : null}
                </div>
                <div className="LeftPane-container-body">
                    {active === 1 ? <LibraryContainer /> : null}
                    {active === 2 ? <SearchContainer 
                        searchResultIds={searchResultIds}
                        setSearchResultIds={setSearchResultIds} /> : null}
                </div>
            </div>
            <ContextMenu />
        </div>
    )
}

export default connect(
    null,
    dispatch => ({
        signOut: () => dispatch(signOut()),
        setItemView: id => dispatch(setItemView(id))
    })
)(LeftPane)
