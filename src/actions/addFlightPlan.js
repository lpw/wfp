import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { addedNewFlightPlan } from './'

export function addFlightPlan( name, userId ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/flightplans`
		const method = 'POST'
		const payload = { name, userId }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action addFlightPlan route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				const { id } = response.result
				assert( id !== undefined )
				dispatch( addedNewFlightPlan( id ) )
			} else {
				console.warn( `action addFlightPlan route 200 but status not ok ${response.status}` )
				throw new Error( `action addFlightPlan route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addFlightPlan route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
