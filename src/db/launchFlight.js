import {
	launchFlightQuery,
} from './queries';

export function launchFlight( flightId, atd ) {
	return new Promise( function( resolve, reject ) {
		launchFlightQuery( flightId, atd, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
