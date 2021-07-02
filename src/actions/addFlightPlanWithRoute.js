import assert from 'assert'
import fetch from 'isomorphic-fetch'
import { getPrefix } from '../utils'
import { addedNewFlightPlan, requestFlightPlan } from './'

export function addFlightPlanWithRoute( name, path, altitude, speed, userId ) {
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
				throw new Error( `action addFlightPlanWithRoute plan not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				const { id } = response.result
				assert( id !== undefined )
				// dispatch( addedNewFlightPlan( id ) )

				const url = `${prefix}/apiv1/flightplan/${id}`
				const method = 'POST'
				const payload = { path, altitude, speed  }

				return fetch( url, {
					method,
					body: JSON.stringify( payload ),
					// headers,
				})
				.then( response => {
					if( response.status === 200 ) {
						return response.json()
					} else {
						throw new Error( `action addFlightPlanWithRoute route not 200 ${response.status}` )
					}
				})
				.then( response => {
					if( response.status === 'ok' ) {
						dispatch( addedNewFlightPlan( id ) )

						// const { id } = response.result
						// assert( id !== undefined )
						// dispatch( addedNewRoute( id ) )
			            dispatch( requestFlightPlan( id ) )
					} else {
						console.warn( `action addFlightPlanWithRoute route 200 but status not ok ${response.status}` )
						throw new Error( `action addFlightPlanWithRoute route 200 but status not ok ${response.status}` )
					}
				})


			} else {
				console.warn( `action addFlightPlanWithRoute plan 200 but status not ok ${response.status}` )
				throw new Error( `action addFlightPlanWithRoute plan 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action addFlightPlanWithRoute plan caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
