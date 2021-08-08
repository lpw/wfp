import {
	landFlightQuery,
} from './queries';

export function landFlight( flightId, ata ) {
	return new Promise( function( resolve, reject ) {
		landFlightQuery( flightId, ata, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
