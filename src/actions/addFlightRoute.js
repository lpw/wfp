// import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { requestFleet } from './'

export function addFlightRoute( aircraft, origin, destination, altitude, speed ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flightroute/${aircraft}`
		const method = 'POST'
		const payload = { aircraft, origin, destination, altitude, speed }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action addFlightRoute not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
	            dispatch( requestFleet() )
			} else {
				console.warn( `action addFlightRoute 200 but status not ok ${response.status}` )
				throw new Error( `action addFlightRoute 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addFlightRoute caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
