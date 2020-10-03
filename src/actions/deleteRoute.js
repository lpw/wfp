import fetch from 'isomorphic-fetch'

export function deleteRoute( fpid, rid ) {
	return( dispatch, getState ) => {
		const prefix = ''	// `http://localhost:3001`
		const url = `${prefix}/apiv1/flightplan/${fpid}/route/${rid}`
		const method = 'DELETE'

		return fetch( url, {
			method,
		})
		.then( response => {
			if( response.status === 200 ) {
				return response.json()
			} else {
				throw new Error( `action deleteRoute route not 200 ${response.status}` )
			}
		})
		.then( response => {
			if( response.status === 'ok' ) {
			} else {
				console.warn( `action deleteRoute route 200 but status not ok ${response.status}` )
				throw new Error( `action deleteRoute route 200 but status not ok ${response.status}` )
			}
		})
		.catch( error => {
			console.error( `action deleteRoute route caught error ${error}` )
			// handleApiError()  // retry, etc.
		})
	}
}
