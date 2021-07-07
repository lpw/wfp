// import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { requestFlight } from './'

export function addRoute( id, path, altitude, speed ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flight/${id}`
		const method = 'POST'
		const payload = { path, altitude, speed }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action addRoute not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				// const { id } = response.result
				// assert( id !== undefined )
				// dispatch( addedNewRoute( id ) )
	            dispatch( requestFlight( id ) )
			} else {
				console.warn( `action addRoute 200 but status not ok ${response.status}` )
				throw new Error( `action addRoute 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addRoute caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
