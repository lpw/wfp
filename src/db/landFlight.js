import {
	landFlightQuery,
} from './queries';

export function landFlight( flightId ) {
	return new Promise( function( resolve, reject ) {
		landFlightQuery( flightId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
