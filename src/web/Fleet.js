// import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { requestFleet, requestPoints, requestRoutes, deleteAircraft } from '../actions'
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
        const { fleet, points, routes, requestPoints, requestFleet, requestRoutes } = props

        if( Object.keys( fleet ).length <= 0 || stale() ) {
            requestFleet()
        }

        if( Object.keys( points ).length <= 0 || stale() ) {
            requestPoints()
        }

        if( Object.keys( routes ).length <= 0 || stale() ) {
            requestRoutes()
        }
    }

    maintenance = id => {
        const { props } = this
        const { fleet, deleteAircraft } = props
        const { name } = fleet[ id ] || {}
        const answer = window.confirm( `Maintenance Panel for ${name}\n\nScrap this aircraft?` )
        if( answer ) {
            deleteAircraft( id )
        }
    }   

    renderAircraftParked = aircraft => {
        const { props, maintenance } = this
        const { points, routes } = props
        const { id, name, originId } = aircraft  
        const routesFrom = routes[ originId ] || {}
        const { altitude, speed } = routesFrom  
        const originPoint = points[ originId ]
        const originCode = originPoint && originPoint.code
        return originPoint && 
            <AircraftParked
                key={id}
                id={id}
                name={name}
                originId={originId}
                originCode={originCode}
                altitude={altitude}
                speed={speed}
                routesFrom={routesFrom} 
                maintenance={maintenance}
            />
    }

    renderAircraftFlight = aircraft => {
        const { props, maintenance } = this
        const { points } = props
        const { 
            id,
            name,
            originId,
            destinationId,
            altitude,
            speed,
        } = aircraft  // distance, pointCound, duration - depends
        const originPoint = points[ originId ]
        const destinationPoint = points[ destinationId ]

        return originPoint && destinationPoint && 
            <AircraftFlight 
                key={id}
                id={id}
                name={name}
                origin={originPoint}
                destination={destinationPoint}
                altitude={altitude}
                speed={speed}
                maintenance={maintenance}
            />
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
    const { fleet, points, routes } = state

    return {
        fleet,
        points,
        routes,
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
        requestRoutes: () => {
            dispatch( requestRoutes() )
        },
        deleteAircraft: ( id ) => {
            dispatch( deleteAircraft( id ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Fleet)
