import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { requestFleet } from './'

export function addFlight( aircraftId, originId, destinationId, altitude, speed, charge ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flights`
		const method = 'POST'
		const payload = { aircraftId, originId, destinationId, altitude, speed, charge }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action addFlight route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				// const { id } = response.result
				const id = response.result
				assert( id !== undefined )
				// dispatch( addedFlight( id ) )
				dispatch( requestFleet() )
			} else {
				console.warn( `action addFlight route 200 but status not ok ${response.status}` )
				throw new Error( `action addFlight route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addFlight route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
