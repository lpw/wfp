import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { receivedRoutes } from './'

export function requestRoutes() {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/routes`
		const method = 'GET'

		return fetch( url, {
			method,
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action requestRoutes not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				dispatch( receivedRoutes( response.result ) )
			} else {
				console.warn( `action requestRoutes 200 but status not ok ${response.status}` )
				throw new Error( `action requestRoutes 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action requestRoutes caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
