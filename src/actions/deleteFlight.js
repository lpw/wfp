import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'

export function deleteFlight( id ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flight/${id}`
		const method = 'DELETE'

		return fetch( url, {
			method,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action deleteFlight route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
			} else {
				console.warn( `action deleteFlight route 200 but status not ok ${response.status}` )
				throw new Error( `action deleteFlight route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action deleteFlight route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
