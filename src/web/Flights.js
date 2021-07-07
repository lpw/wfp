import React, { Component } from 'react'
import { connect } from 'react-redux'
import { requestFlights, requestFleet } from '../actions'
import FlightLink from './FlightLink'
import AddFlight from './AddFlight'
import {
    flightsFromState,
    aircraftNameFromId,
} from '../selectors'
import './Flight.css'

const stale = () => true // TBD what determines when to refetch flight  - always for now

class Flights extends Component {
    componentDidMount() {
        const { props } = this
        const { flights, aircraft, requestFlights, requestFleet } = props

        if( flights.length <= 0 || stale() ) {
            requestFlights()
        }

        if( aircraft.length <= 0 || stale() ) {
            requestFleet()
        }
    }

    renderFlight = flight => {
        const { id, aircraft, path, altitude, speed, distance, pointCount } = flight  // altitude, duration - depends]
        return <FlightLink key={id} id={id} aircraft={aircraft} path={path} altitude={altitude} speed={speed} distance={distance} pointCount={pointCount} />
    }

    renderFlights = flights => {
        const { renderFlight } = this

        return (
            <React.Fragment>
                { flights.map( p => renderFlight( p ) ) }
            </React.Fragment>
        )
    }

    render() {
        const { renderFlights, props } = this
        const { flights, userId } = props

        return (
            <div className="flights">
                { renderFlights( flights ) }
                { !!userId && <AddFlight /> }
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { userId, aircraft } = state
    const flights = flightsFromState( state )
    const flightsWithAircraft = flights.map( fp => ({
        ...fp,
        aircraft: aircraftNameFromId( state, +fp.aircraft )
    }))

    return {
        flights: flightsWithAircraft,
        aircraft,
        userId
    }
}


const mapDispatchToProps = dispatch => {
    return {
        requestFlights: () => {
            dispatch( requestFlights() )
        },
        requestFleet: () => {
            dispatch( requestFleet() )
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Flights)
