import fetch from 'isomorphic-fetch'

export function landAircraft( id ) {
	return( dispatch, getState ) => {
		const url = `http://localhost:7401/apiv1/fleet/${id}`
		const method = 'POST'
		const action = 'land'
		const payload = { action }

		return fetch( url, {
			method,
			body: JSON.stringify( payload ),
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action landAircraft route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
				// // could change local state directly, but for now just reget the whole fleet
				// dispatch( requestFleet() )
			} else {
				console.warn( `action landAircraft route 200 but status not ok ${response.status}` )
				throw new Error( `action landAircraft route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action landAircraft route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
