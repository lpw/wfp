import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
// import { requestFleet } from './'

export function landFlight( id, ata ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flight/${id}`
		const method = 'POST'
		const action = 'land'
		const payload = { action, ata }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
			headers: {"Content-Type": "application/json"}
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action landFlight route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				// // could change local state directly, but for now just reget the whole fleet
				// dispatch( requestFleet() )
			} else {
				console.warn( `action landFlight route 200 but status not ok ${response.status}` )
				throw new Error( `action landFlight route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action landFlight route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
