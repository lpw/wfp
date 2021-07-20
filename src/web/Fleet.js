// import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { requestFleet, requestPoints } from '../actions'
import AircraftParked from './AircraftParked'
import AircraftFlight from './AircraftFlight'
import AddAircraft from './AircraftAdd'
// import { getCodeFromPath } from '../utils'
import {
    // fleetFromState,
} from '../selectors'
import './Fleet.css'
import './AircraftFlight.css'  // for/from Flight and Parked rows

const stale = () => true // TBD what determines when to refetch flight  - always for now

class Fleet extends Component {
    componentDidMount() {
        const { props } = this
        const { fleet, points, requestPoints, requestFleet } = props

        if( Object.keys( fleet ).length <= 0 || stale() ) {
            requestFleet()
        }

        if( Object.keys( points ).length <= 0 || stale() ) {
            requestPoints()
        }
    }

    renderAircraftParked = aircraft => {
        const { props } = this
        const { points } = props
        const { id, name, originId } = aircraft  
        const originPoint = points[ originId ]
        // assert( originPoint )
        // const origin = getCodeFromPath( base, points )
        return originPoint && <AircraftParked key={id} id={id} name={name} originId={originId} points={points} />
    }

    // renderAircraftFlight = aircraft => {
    //     const { props } = this
    //     const { points } = props
    //     const { id, name, path, altitude, speed } = aircraft  // distance, pointCound, duration - depends
    //     const paths = path && path.split( /\s/ )
    //     const path0 = paths.length > 0 ? paths[ 0 ].toUpperCase().trim() : ''
    //     const path1 = paths.length > 1 ? paths[ 1 ].toUpperCase().trim() : ''
    //     const origin = getCodeFromPath( path0, points )
    //     const destination = getCodeFromPath( path1, points )
    //     return <AircraftFlight key={id} id={id} name={name} origin={origin} destination={destination} altitude={altitude} speed={speed} />
    // }

    renderAircraftFlight = aircraft => {
        const { props } = this
        const { points } = props
        const { id, name, originId, destinationId, aircraftAltitude: altitude, aircraftSpeed: speed } = aircraft  // distance, pointCound, duration - depends
        const originPoint = points[ originId ]
        const destinationPoint = points[ destinationId ]
        // assert( originPoint )
        // assert( destinationPoint )

        return originPoint && destinationPoint && <AircraftFlight key={id} id={id} name={name} origin={originPoint} destination={destinationPoint} altitude={altitude} speed={speed} />
    }

    renderFleet = fleet => {
        const { renderAircraftFlight, renderAircraftParked } = this

                // { Object.keys( fleet ).map( k => fleet[ k ] ).map( a => ( !!a.atd && !a.ata ) ? renderAircraftFlight( a ) : renderAircraftParked( a ) ) }
        return (
            <React.Fragment>
                { Object.keys( fleet ).map( k => fleet[ k ] ).map( a => ( !!a.etd && !a.ata ) ? renderAircraftFlight( a ) : renderAircraftParked( a ) ) }
            </React.Fragment>
        )
    }

    render() {
        const { renderFleet, props } = this
        const { fleet, points } = props

        return (
            <div className="fleet">
                { renderFleet( fleet ) }
                <AddAircraft points={points} />
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { fleet, points } = state

    return {
        fleet,
        points,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        requestFleet: () => {
            dispatch( requestFleet() )
        },
        requestPoints: () => {
            dispatch( requestPoints() )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Fleet)
