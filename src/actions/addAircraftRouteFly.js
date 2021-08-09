// import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
// import { requestFleet } from './'

export function addAircraftRouteFly( name, origin, destination, altitude, speed ) {
	return( dispatch, getState ) => {
        const prefix = getPrefix()
		const url = `${prefix}/apiv1/aircraftRouteFly`
		const method = 'POST'
		const payload = { name, origin, destination, altitude, speed }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
			headers: {"Content-Type": "application/json"}
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action addAircraftRouteFly route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				// const { aircraftId, aircraftName, pointId } = response.result
				// assert( aircraftId !== undefined )
				// dispatch( addedAircraft( aircraftId, aircraftName, pointId ) )
				// dispatch( flyAircraft( aircraftId ) )
				// dispatch( requestFleet() )
				// because the page redirects
			} else {
				console.warn( `action addAircraftRouteFly route 200 but status not ok ${response.status}` )
				throw new Error( `action addAircraftRouteFly route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addAircraftRouteFly route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
