// import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { requestFleet, requestRoutes, deleteAircraft } from '../actions'
import AircraftParked from './AircraftParked'
import AircraftFlying from './AircraftFlying'
import AddAircraft from './AircraftAdd'
// import { getCodeFromPath } from '../utils'
import {
    // fleetFromState,
} from '../selectors'
import './Fleet.css'
import './AircraftFlying.css'  // for/from Flight and Parked rows

const stale = () => false // TBD what determines when to refetch flight  - always for now

class Fleet extends Component {
    componentDidMount() {
        const { props } = this
        const { fleet, routes, requestFleet, requestRoutes } = props

        if( Object.keys( fleet ).length <= 0 || stale() ) {
            requestFleet()
        }

        // if( Object.keys( points ).length <= 0 || stale() ) {
        //     requestPoints()
        // }

        if( Object.keys( routes ).length <= 0 || stale() ) {
            requestRoutes()
        }
    }

    history = id => {
        const { props } = this
        const { fleet } = props
        const { name } = fleet[ id ] || {}
        const answer = window.alert( `History Panel (past flights, etc.) for ${name}` )
    }   

    schedule = id => {
        const { props } = this
        const { fleet } = props
        const { name } = fleet[ id ] || {}
        const answer = window.alert( `Schedule Panel (reserve new flights, etc.) for ${name}` )
    }   

    maintenance = id => {
        const { props } = this
        const { fleet, deleteAircraft } = props
        const { name } = fleet[ id ] || {}
        const answer = window.confirm( `Maintenance Panel\n(hours, inspetions, ADs, certificates, squawks, etc...)\nfor ${name}\n\nScrap this aircraft ?!` )
        if( answer ) {
            deleteAircraft( id )
        }
    }   

    renderAircraftParked = aircraft => {
        const { props, maintenance, schedule, history } = this
        const { routes } = props
        const {
            id,
            name,
            originId,
            destinationId,
            baseId,
            destinationCode,
            originCode,
            baseCode,
        } = aircraft  
        const locationId = destinationId || originId || baseId
        const locationCode = destinationCode || originCode || baseCode
        const routesFrom = routes[ locationId ] || []
        // const { altitude, speed } = routesFrom  
        return id && name && locationCode && 
            <AircraftParked
                key={id}
                id={id}
                name={name}
                locationCode={locationCode}
                routesFrom={routesFrom} 
                maintenance={maintenance}
                history={history}
                schedule={schedule}
            />
    }

    renderAircraftFlying = aircraft => {
        const { maintenance, schedule, history } = this
        const { 
            id,
            name,
            baseCode,
            originCode: originCodeMaybeNull,
            destinationCode,
        } = aircraft  // distance, pointCound, duration - depends
        const originCode = originCodeMaybeNull || baseCode

        return id && name && originCode && destinationCode && 
            <AircraftFlying 
                key={id}
                id={id}
                name={name}
                originCode={originCode}
                destinationCode={destinationCode}
                maintenance={maintenance}
                history={history}
                schedule={schedule}
            />
    }

    renderFleet = fleet => {
        const { renderAircraftFlying, renderAircraftParked } = this

                // { Object.keys( fleet ).map( k => fleet[ k ] ).map( a => ( !!a.atd && !a.ata ) ? renderAircraftFlying( a ) : renderAircraftParked( a ) ) }
        return (
            <React.Fragment>
                { Object.keys( fleet ).map( k => fleet[ k ] ).map( a => ( !!a.etd && !a.ata && a.destinationCode ) ? renderAircraftFlying( a ) : renderAircraftParked( a ) ) }
            </React.Fragment>
        )
    }

    render() {
        const { renderFleet, props } = this
        const { fleet } = props

        return (
            <div className="fleet">
                { renderFleet( fleet ) }
                <AddAircraft  />
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { fleet, routes } = state

    return {
        fleet,
        routes,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        requestFleet: () => {
            dispatch( requestFleet() )
        },
        // requestPoints: () => {
        //     dispatch( requestPoints() )
        // },
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
