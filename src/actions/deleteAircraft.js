import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { requestFleet } from './'

export function deleteAircraft( id ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/fleet/${id}`
		const method = 'DELETE'

		return fetch( url, {
			method,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action deleteAircraft route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				// dispatch( deletedAircraft( id ) )
				// could remove from state, but for now just reget the whole fleet
				dispatch( requestFleet() )
			} else {
				console.warn( `action deleteAircraft route 200 but status not ok ${response.status}` )
				throw new Error( `action deleteAircraft route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action deleteAircraft route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
