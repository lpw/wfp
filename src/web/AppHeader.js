import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { loginUser } from '../actions'
// import { userNameFromId } from '../selectors'
import { setLocalStorage, getLocalStorage } from '../utils'
import './AppHeader.css'

const storedUser = getLocalStorage( 'user' )

class AppHeader extends Component {
	constructor(props) {
		super(props);
		this.userRef = React.createRef()
	}

    componentDidMount() {
        const { props } = this
        const { userId, loginUser } = props

        // if( users.length <= 0 ) {
        //     requestUsers()
        // }

        if( !userId && userId !== storedUser ) {
            loginUser( storedUser )
        }
    }

    typeUser = event => {
        const { userRef, loginUser } = this

        const userId = userRef.current.value.trim()

        if( event.key === 'Enter' && userId ) {
            loginUser()
        }
    }

    loginUser = () => {
        const { props, userRef } = this
        const { loginUser } = props

        const userId = userRef.current.value

        if( userId ) {
            loginUser( userId )
            setLocalStorage( 'user', userId )
            userRef.current.blur()
        }
    }

    renderLogin = () => {
        const { props, loginUser, typeUser } = this
        const { userId } = props

            // <select onChange={loginUser} className="login" id="login" ref={this.userRef}>
            //     <option value="">{ loggedInUserName ? `Logout ${loggedInUserName}` : 'Login' }</option>
            //     { users.map( u => <option key={u.id} value={u.id}>{u.name}</option> ) }
            // </select>
        return (
            <input type="text" onKeyUp={typeUser} onBlur={loginUser} className="login" id="login" ref={this.userRef} placeholder="user.name (@wisk.aero) enables add..." defaultValue={userId} />
        )
    }

    render() {
        const { renderLogin } = this
        // const { loggedInUserName } = props

                // { loggedInUserName && <NavLink to="/add" className="buttonClassName">Add a Flight Plan</NavLink> }
        return (
            <div className="AppHeader">
                <NavLink to="/" className="buttonClassName">List Flight Plans</NavLink>
                {renderLogin()}
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { userId } = state
    // const loggedInUserName = userNameFromId( state, userId )

    return {
        // loggedInUserName,
        userId,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        // requestUsers: () => {
        //     dispatch( requestUsers() )
        // },
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
