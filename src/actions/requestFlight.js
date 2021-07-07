import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import {
	receivedFlight,
	receivedRoutes,
	receivedPoints,
	} from './'

export function requestFlight( id ) {
	return( dispatch, getState ) => {
		// Could decompose the flight api down into separate requests for routes and points
		// which could be helpful if route and point data become heavy and there's significant shared usage
		// const url = 'http://localhost:3001/apiv1/s'
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flight/${id}`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestFlight not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				if( response.result ) {
					const { flight, routes, points } = response.result
					// dispatch points, then routes, then the flight - in reverse order of their dependencies
					dispatch( receivedPoints( points ) )
					dispatch( receivedRoutes( routes ) )
					dispatch( receivedFlight( flight ) )
				} else {
					console.warn( `action requestFlight 200 and status ok but no result` )
					throw new Error( `action requestFlight 200 and status ok but no result` )
				}
			} else {
				console.warn( `action requestFlight 200 but status not ok ${response.status}` )
				throw new Error( `action requestFlight 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestFlight caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
