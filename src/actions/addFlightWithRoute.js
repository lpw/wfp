import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { addedNewFlight, requestFlight } from './'

export function addFlightWithRoute( aircraftId, path, altitude, speed ) {
	return( dispatch, getState ) => {
		const prefix = getPrefix()
		const url = `${prefix}/apiv1/flights`
		const method = 'POST'
		const payload = { aircraftId }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
			// headers,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action addFlightWithRoute not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				const { id } = response.result
				assert( id !== undefined )
				// dispatch( addedNewFlight( id ) )

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
						throw new Error( `action addFlightWithRoute route not 200 ${response.status}` )
					}
				})
				.then( response => {
					if( response.status === 'ok' ) {
						dispatch( addedNewFlight( id ) )

						// const { id } = response.result
						// assert( id !== undefined )
						// dispatch( addedNewRoute( id ) )
						dispatch( requestFlight( id ) )
					} else {
						console.warn( `action addFlightWithRoute route 200 but status not ok ${response.status}` )
						throw new Error( `action addFlightWithRoute route 200 but status not ok ${response.status}` )
					}
				})


			} else {
				console.warn( `action addFlightWithRoute 200 but status not ok ${response.status}` )
				throw new Error( `action addFlightWithRoute 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addFlightWithRoute caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
