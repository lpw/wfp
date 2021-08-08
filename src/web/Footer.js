import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import './Footer.css'

class Footer extends Component {
    render() {
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
    return {
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Footer)
