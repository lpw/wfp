import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import {
	receivedFlightPlan,
	receivedRoutes,
	receivedPoints,
	} from './'

export function requestFlightPlan( id ) {
	return( dispatch, getState ) => {
		// Could decompose the flight plan api down into separate requests for routes and points
		// which could be helpful if route and point data become heavy and there's significant shared usage
		// const url = 'http://localhost:3001/apiv1/plans'
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flightplan/${id}`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestFlightPlan not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				if( response.result ) {
					const { flightPlan, routes, points } = response.result
					// dispatch points, then routes, then the flight plan - in reverse order of their dependencies
					dispatch( receivedPoints( points ) )
					dispatch( receivedRoutes( routes ) )
					dispatch( receivedFlightPlan( flightPlan ) )
				} else {
					console.warn( `action requestFlightPlan 200 and status ok but no result` )
					throw new Error( `action requestFlightPlan 200 and status ok but no result` )
				}
			} else {
				console.warn( `action requestFlightPlan 200 but status not ok ${response.status}` )
				throw new Error( `action requestFlightPlan 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestFlightPlan caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
