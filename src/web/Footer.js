import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
// import { loginUser } from '../actions'
// import { userNameFromId } from '../selectors'
// import { setLocalStorage, getLocalStorage } from '../utils'
import './Footer.css'

// const storedUser = getLocalStorage( 'user' )

class Footer extends Component {
	// constructor(props) {
	// 	super(props);
	// }

    // componentDidMount() {
    //     const { props } = this
    //     const { userId, loginUser } = props
    // }

    render() {
        const { renderLogin } = this
        // const { loggedInUserName } = props

                // { loggedInUserName && <NavLink to="/add" className="buttonClassName">Add a Flight</NavLink> }
        return (
            <div className="Footer">
                <NavLink to="/fleet" className="buttonClassName">Fleet</NavLink>
                <NavLink to="/supervise" className="buttonClassName">Supervise</NavLink>
                <NavLink to="/routes" className="buttonClassName">Routes</NavLink>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // const { userId } = state
    // const loggedInUserName = userNameFromId( state, userId )

    return {
        // loggedInUserName,
        // userId,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        // requestUsers: () => {
        //     dispatch( requestUsers() )
        // },
        // loginUser: userId => {
        //     dispatch( loginUser( userId ) )
        // },
        // logout: () => {
        //     dispatch( logout() )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Footer)
