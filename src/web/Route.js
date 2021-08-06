import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { removeRoute } from '../actions'
import { getIdFromText } from '../utils'
import {
    // routeParkedFromState,
} from '../selectors'
import './Route.css' 

class Route extends Component {
    constructor(props) {
        super(props);

        // this.speedRef = React.createRef()
        // this.altitudeRef = React.createRef()
        this.destinationRef = React.createRef()

        this.state = { disabled: true }
    }

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
            // id,
            originCode,
            destinationCode,
            altitude,
            speed,
            // name,
        } = props
        // const { disabled } = state 
                    // // <input type="text" onKeyUp={check} onBlur={check} className="routeRowDestination" ref={this.destinationRef} placeholder="Destination..." />
                    // // <input type="number" onKeyUp={check} onBlur={check} className="routeRowButton routeRowAltitude" ref={this.altitudeRef} placeholder="Altitude..." />
                    // // <input type="number" onKeyUp={check} onBlur={check} className="routeRowButton routeRowSpeed" ref={this.speedRef} placeholder="Speed..." />
                    // <span className="routeRowName">{ name }</span>
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
                <button className="routeRowRightButton" onClick={remove}>Delete</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // const { userId } = state
    // const routeParked = routeParkedFromState( state )

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
