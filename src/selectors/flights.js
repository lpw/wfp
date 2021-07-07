/* eslint-disable no-mixed-operators */

// could keep one active flight , or in an array, or in a dictionary, hence the selection abstraction
// and/or could memoize to improve performance

import assert from 'assert'

export const flightsFromState = ( state ) => {
    const { flights } = state
    assert( flights )
	return Object.values( flights )	// now that flights is not just an array, could impose some order besides dictionary order
}

export const flightFromId = ( state, id ) => {
	// const flight = flights.find( p => p.id === id )
    const { flights } = state
    const flight = flights[ id ]
    // assert( flight )
    if( !flights ) {
    	console.warn( 'Selector flightFromId no flight  for id', id )
    }
	return flight
}

export const routeFromId = ( state, id ) => {
    const { routes } = state
    const route = routes[ id ]
    if( !route ) {
    	console.warn( 'Selector routeFromId no route for id', id )
    }
	return route
}

export const nameFromFlightId = ( state, id ) => {
    const flight = flightFromId( state, id )
	return flight && flight.name || ''
}

export const routeIdsFromFlightId = ( state, id ) => {
    const flight = flightFromId( state, id )
	return flight && flight.routeIds || []
}

export const routePathFromRouteId = ( state, id ) => {
    const route = routeFromId( state, id )
    return route && route.path || ''
}

export const routeAltitudeFromRouteId = ( state, id ) => {
    const route = routeFromId( state, id )
    return route && route.altitude || 0
}

export const routeSpeedFromRouteId = ( state, id ) => {
    const route = routeFromId( state, id )
    return route && route.speed || 0
}

export const routePointsFromRouteId = ( state, id ) => {
    const route = routeFromId( state, id )
	const pointIds = route && route.pointIds || []
	return pointIds.map( p => state.points[ p ] )
}
