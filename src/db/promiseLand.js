import {
	landQuery,
} from './queries';

export function land( flightId ) {
	return new Promise( function( resolve, reject ) {
		landQuery( flightId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
