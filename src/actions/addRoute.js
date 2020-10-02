// import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { requestFlightPlan } from './'

export function addRoute( id, description, altitude ) {
	return( dispatch, getState ) => {
		const prefix = ''	// `http://localhost:3001`
		const url = `${prefix}/apiv1/flightplan/${id}`
		const method = 'POST'
		const payload = { description, altitude }

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
	            dispatch( requestFlightPlan( id ) )
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
