/* eslint-disable no-mixed-operators */

// could keep one active flight , or in an array, or in a dictionary, hence the selection abstraction
// and/or could memoize to improve performance

// import assert from 'assert'

// export const flightsFromState = ( state ) => {
//     const { flights } = state
//     assert( flights )
// 	return Object.values( flights )	// now that flights is not just an array, could impose some order besides dictionary order
// }

// export const flightFromId = ( state, id ) => {
// 	// const flight = flights.find( p => p.id === id )
//     const { flights } = state
//     const flight = flights[ id ]
//     // assert( flight )
//     if( !flights ) {
//     	console.warn( 'Selector flightFromId no flight  for id', id )
//     }
// 	return flight
// }

export const aircraftFromId = ( state, id ) => {
    const { fleet } = state
    const aircraft = fleet.find( a => a.id === id )
    // const aircraft = fleet[ id ]
    // assert( aircraft )
    if( !aircraft ) {
        console.warn( 'Selector aircraftFromId no aircraft for id', id )
    }
    return aircraft
}

// export const routeFromId = ( state, id ) => {
//     const { routes } = state
//     const route = routes[ id ]
//     if( !route ) {
//     	console.warn( 'Selector routeFromId no route for id', id )
//     }
// 	return route
// }

// export const nameFromFlightId = ( state, id ) => {
//     const flight = flightFromId( state, id )
// 	return flight && flight.name || ''
// }

// export const routeIdsFromFlightId = ( state, id ) => {
//     const flight = flightFromId( state, id )
//     return flight && flight.routeIds || []
// }

// export const routeIdsFromAircraftId = ( state, id ) => {
//     const aircraft = aircraftFromId( state, id )
//     return aircraft && aircraft.routeIds || []
// }

export const pointsFromAircraftId = ( state, id ) => {
    const aircraft = aircraftFromId( state, id )
    let points = []
    if( aircraft ) {
        if( aircraft.origin || aircraft.base ) {
            const pointId = aircraft.origin || aircraft.base
            if( pointFromPointId( state, pointId ) ) {
                points = points.concat( pointFromPointId( state, pointId ) )
            }
        }
        if( aircraft.destination ) {
            const pointId = aircraft.destination
            if( pointFromPointId( state, pointId ) ) {
                points = points.concat( pointFromPointId( state, pointId ) )
            }
        }
    }
    return points
}

export const altitudeFromAircraftId = ( state, id ) => {
    const aircraft = aircraftFromId( state, id )
    return aircraft && aircraft.altitude || 0
}

export const speedFromAircraftId = ( state, id ) => {
    const aircraft = aircraftFromId( state, id )
    return aircraft && aircraft.speed || 0
}

// export const routePathFromRouteId = ( state, id ) => {
//     const route = routeFromId( state, id )
//     return route && route.path || ''
// }

// export const routeAltitudeFromRouteId = ( state, id ) => {
//     const route = routeFromId( state, id )
//     return route && route.altitude || 0
// }

// export const routeSpeedFromRouteId = ( state, id ) => {
//     const route = routeFromId( state, id )
//     return route && route.speed || 0
// }

// export const routePointsFromRouteId = ( state, id ) => {
//     const route = routeFromId( state, id )
// 	const pointIds = route && route.pointIds || []
// 	return pointIds.map( p => state.points[ p ] )
// }

// export const pointsFromPointIds = ( state, id ) => {
//     return pointIds.map( p => state.points[ p ] || {} )
// }

const pointFromPointId = ( state, id ) => {
    return state.points[ id ] || {}
}
