import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { requestUsers, loginUser } from '../actions'
import { userNameFromId } from '../selectors'
import './AppHeader.css'

class AppHeader extends Component {
	constructor(props) {
		super(props);
		this.userRef = React.createRef()
	}

    componentDidMount() {
        const { users, requestUsers } = this.props

        if( users.length <= 0 ) {
            requestUsers()
        }
    }

    loginUser = () => {
        const { props, userRef } = this
        const { loginUser } = props

        const userId = userRef.current.value

        loginUser( userId )
    }

    renderLogin = () => {
        const { props, loginUser } = this
        const { loggedInUserName, users } = props

        return (
            <select onChange={loginUser} className="login" id="login" ref={this.userRef}>
                <option value="">{ loggedInUserName ? `Logout ${loggedInUserName}` : 'Login' }</option>
                { users.map( u => <option key={u.id} value={u.id}>{u.name}</option> ) }
            </select>
        )
    }

    render() {
        const { renderLogin, props } = this
        const { loggedInUserName } = props

        return (
            <div className="AppHeader">
                <NavLink to="/" className="buttonClassName">List Flight Plans</NavLink>
                { loggedInUserName && <NavLink to="/add" className="buttonClassName">Add a Flight Plan</NavLink> }
                {renderLogin()}
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { userId, users } = state
    const loggedInUserName = userNameFromId( state, userId )

    return {
        loggedInUserName,
        users,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        requestUsers: () => {
            dispatch( requestUsers() )
        },
        loginUser: userId => {
            dispatch( loginUser( userId ) )
        },
        // logout: () => {
        //     dispatch( logout() )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppHeader)
