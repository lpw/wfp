import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'

export function deleteFlightPlan( id ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flightplan/${id}`
		const method = 'DELETE'

		return fetch( url, {
			method,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action deleteFlightPlan route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
			} else {
				console.warn( `action deleteFlightPlan route 200 but status not ok ${response.status}` )
				throw new Error( `action deleteFlightPlan route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action deleteFlightPlan route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
