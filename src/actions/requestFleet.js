import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { receivedFleet } from './'

export function requestFleet() {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/fleet`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestFleet not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				dispatch( receivedFleet( response.result ) )
			} else {
				console.warn( `action requestFleet 200 but status not ok ${response.status}` )
				throw new Error( `action requestFleet 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestFleet caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
