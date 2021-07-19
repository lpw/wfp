import {
	launchFlightQuery,
} from './queries';

export function launchFlight( flightId ) {
	return new Promise( function( resolve, reject ) {
		launchFlightQuery( flightId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
