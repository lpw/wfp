import fetch from 'isomorphic-fetch'
import { receivedFlightPlans } from './'

export function requestFlightPlans() {
	return( dispatch, getState ) => {
		const prefix = ''	// `http://localhost:3001`
		const url = `${prefix}/apiv1/flightplans`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestFlightPlans not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				dispatch( receivedFlightPlans( response.result ) )
			} else {
				console.warn( `action requestFlightPlans 200 but status not ok ${response.status}` )
				throw new Error( `action requestFlightPlans 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestFlightPlans caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
