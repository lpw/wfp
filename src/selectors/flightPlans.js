/* eslint-disable no-mixed-operators */

// could keep one active flight plan, or in an array, or in a dictionary, hence the selection abstraction
// and/or could memoize to improve performance

import assert from 'assert'

export const flightPlansFromState = ( state ) => {
    const { flightPlans } = state
    assert( flightPlans )
	return Object.values( flightPlans )	// now that flightPlans is not just an array, could impose some order besides dictionary order
}

export const flightPlanFromId = ( state, id ) => {
	// const flightPlan = flightPlans.find( p => p.id === id )
    const { flightPlans } = state
    const flightPlan = flightPlans[ id ]
    // assert( flightPlan )
    if( !flightPlans ) {
    	console.warn( 'Selector flightPlanFromId no flight plan for id', id )
    }
	return flightPlan
}

export const routeFromId = ( state, id ) => {
    const { routes } = state
    const route = routes[ id ]
    if( !route ) {
    	console.warn( 'Selector routeFromId no route for id', id )
    }
	return route
}

export const nameFromFlightPlanId = ( state, id ) => {
    const flightPlan = flightPlanFromId( state, id )
	return flightPlan && flightPlan.name || ''
}

export const routeIdsFromFlightPlanId = ( state, id ) => {
    const flightPlan = flightPlanFromId( state, id )
	return flightPlan && flightPlan.routeIds || []
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
