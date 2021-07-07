import {
	aircraftQuery,
} from './queries';

export function promiseAircraft() {
	const aircraftPromise = new Promise( function( resolve, reject ) {
		aircraftQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}

			resolve( rows )
		})
	})

	return aircraftPromise
}
