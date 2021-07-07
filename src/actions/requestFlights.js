import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { receivedFlights } from './'

export function requestFlights() {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flights`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestFlights not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				dispatch( receivedFlights( response.result ) )
			} else {
				console.warn( `action requestFlights 200 but status not ok ${response.status}` )
				throw new Error( `action requestFlights 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestFlights caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
