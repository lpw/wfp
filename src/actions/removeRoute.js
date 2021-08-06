import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { requestRoutes } from './'

export function removeRoute( id ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/routes/${id}`
		const method = 'DELETE'

		return fetch( url, {
			method,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action removeRoute route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
	            dispatch( requestRoutes() )
			} else {
				console.warn( `action removeRoute route 200 but status not ok ${response.status}` )
				throw new Error( `action removeRoute route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action deleteRoute route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
