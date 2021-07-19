import {
	updateFlightETAQuery,
} from './queries';

export function updateFlightETA( flightId, eta ) {
	return new Promise( function( resolve, reject ) {
		updateFlightETAQuery( flightId, eta, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
