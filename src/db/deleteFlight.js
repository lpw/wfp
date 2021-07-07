import {
	deleteFlightQuery,
} from './queries';

export function deleteFlight( id ) {
	return new Promise( function( resolve, reject ) {
		deleteFlightQuery( id, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
