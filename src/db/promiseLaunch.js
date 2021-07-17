import {
	launchQuery,
} from './queries';

export function promiseLaunch( flightId ) {
	return new Promise( function( resolve, reject ) {
		launchQuery( flightId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
