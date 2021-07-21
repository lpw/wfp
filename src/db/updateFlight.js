import {
	updateFlightQuery,
} from './queries';

export function updateFlight( flightId, eta, elapsed, coveredDistance ) {
	return new Promise( function( resolve, reject ) {
		updateFlightQuery( flightId, eta, elapsed, coveredDistance, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
