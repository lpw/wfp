import fetch from 'isomorphic-fetch'
import { receivedUsers } from './'

export function requestUsers() {
	return( dispatch, getState ) => {
		const prefix = `http://localhost:3001`
		const url = `${prefix}/apiv1/users`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestUsers not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				dispatch( receivedUsers( response.result ) )
			} else {
				console.warn( `action requestUsers 200 but status not ok ${response.status}` )
				throw new Error( `action requestUsers 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestUsers caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
