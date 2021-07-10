import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteAircraft, addFlightRoute } from '../actions'
import { getIdFromPath } from '../utils'
import {
    // aircraftParkedFromState,
} from '../selectors'
// import './AircraftParked.css'

class AircraftParked extends Component {
    constructor(props) {
        super(props);

        this.speedRef = React.createRef()
        this.altitudeRef = React.createRef()
        this.destinationRef = React.createRef()

        this.state = { disabled: true }
    }

    check = () => {
        const { props, speedRef, altitudeRef, destinationRef } = this
        const { points } = props  

        const speed = speedRef.current.value
        const altitude = altitudeRef.current.value
        const destination = getIdFromPath( destinationRef.current.value, points )

        this.setState ( {
            disabled: !speed || !altitude || !destination
        } )
    }

    launch = () => {
        const { props, speedRef, altitudeRef, destinationRef } = this
        const { id, origin, deleteAircraft, addFlightRoute, points } = props  

        const speed = speedRef.current.value
        const altitude = altitudeRef.current.value
        const destination = getIdFromPath( destinationRef.current.value, points )

        if( speed && altitude && destination ) {
            if( speed === '0' && altitude === '0' && destination === '0' ) {
                deleteAircraft( id )
            } else {
                addFlightRoute( id, origin.id, destination, altitude, speed )
            }
        }
    }

    render() {
        const { props, launch, check } = this
        const { name, origin } = props

        return (
            <div className="aircraftRow">
                <div className="aircraftRowFields">
                    <span className="aircraftRowName">{ name }</span>
                    <span className="aircraftRowOrigin">{ origin.code }</span>
                    <span className="aircraftRowArrow">&#x2192;</span>
                    <input type="text" onKeyUp={check} onBlur={check} className="aircraftRowDestination" ref={this.destinationRef} placeholder="Filed destination..." />
                    <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowAltitude" ref={this.altitudeRef} placeholder="Filed altitude..." />
                    <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowSpeed" ref={this.speedRef} placeholder="Filed speed..." />
                </div>
                <button className="aircraftRowButton" onClick={launch} disabled={ this.state.disabled }>Launch</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // const { userId } = state
    // const aircraftParked = aircraftParkedFromState( state )

    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        deleteAircraft: ( id ) => {
            dispatch( deleteAircraft( id ) )
        },
        addFlightRoute: ( aircraft, origin, destination, altitude, speed ) => {
            dispatch( addFlightRoute( aircraft, origin, destination, altitude, speed ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftParked)
