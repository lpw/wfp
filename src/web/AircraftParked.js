import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteAircraft, addFlightRoute } from '../actions'
import { getIdFromPath } from '../utils'
import {
    // aircraftParkedFromState,
} from '../selectors'
// import './AircraftParked.css' using AircraftFlight, which is imported from fleet

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
        const { 
            props, 
            state,
            launch,
            check,
            schedule,
            history,
            maintenance,
         } = this
        const { name, origin } = props
        const { disabled } = state 
        return (
            <div className="aircraftRow">
                 <div className="aircraftRowFields">
                    <span className="aircraftRowName">{ name }</span>
                    <button className="aircraftRowButtonSchedule" onClick={ schedule } disabled={ true }>Schedule</button>
                    <button className="aircraftRowButtonHistory" onClick={ history } disabled={ true }>History</button>
                    <button className="aircraftRowButtonMaintenance" onClick={ maintenance } disabled={ true }>Maintenance</button>
                    <span className="aircraftRowOrigin">{ origin.code }</span>
                    <span className="aircraftRowArrow">&#x2192;</span>
                    <input type="text" onKeyUp={check} onBlur={check} className="aircraftRowDestination" ref={this.destinationRef} placeholder="destination..." />
                    <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowButton aircraftRowAltitude" ref={this.altitudeRef} placeholder="altitude..." />
                    <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowButton aircraftRowSpeed" ref={this.speedRef} placeholder="speed..." />
                </div>
                <button className="aircraftRowButton aircraftRowRightButton" onClick={launch} disabled={ disabled }>Request</button>
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
