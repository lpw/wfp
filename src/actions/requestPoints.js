import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { receivedPoints } from './'

export function requestPoints() {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/points`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestPoints not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				dispatch( receivedPoints( response.result ) )
			} else {
				console.warn( `action requestPoints 200 but status not ok ${response.status}` )
				throw new Error( `action requestPoints 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestPoints caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
