import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { removeRoute } from '../actions'
import './Route.css' 

class Route extends Component {
    remove = () => {
        const { props } = this
        const { id, remove } = props  

        assert( id )

        if( id ) {
            remove( id )
        }
    }

    render() {
        const { 
            props, 
            remove, 
         } = this

        const {
            originCode,
            destinationCode,
            altitude,
            speed,
        } = props
        
        return (
            <div className="routeRow">
                <div className="routeRowFields">
                    <div className="routeRowLocations">
                        <div className="routeRowOrigin">{ originCode }</div>
                        <div className="routeRowArrow">&#x2192;</div>
                        <div className="routeRowDestination">{ destinationCode }</div>
                    </div>
                    <div className="routeRowAltitude">{ altitude }&#183;ft</div>
                    <div className="routeRowSpeed">{ speed }&#183;kts</div>
                </div>
                <button className="routeRowRightButton" disabled="true">Waypoints</button>
                <button className="routeRowRightButton" onClick={remove}>Delete</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        remove: ( routeId ) => {
            dispatch( removeRoute( routeId ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Route)
