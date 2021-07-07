import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { addedAircraft } from './'

export function addAircraftToFleet( name, pointId ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/fleet`
		const method = 'POST'
		const payload = { name, pointId }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action addAircraftToFleet route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				const { aircraftId, aircraftName, pointId } = response.result
				assert( aircraftId !== undefined )
				dispatch( addedAircraft( aircraftId, aircraftName, pointId ) )
			} else {
				console.warn( `action addAircraftToFleet route 200 but status not ok ${response.status}` )
				throw new Error( `action addAircraftToFleet route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addAircraftToFleet route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
