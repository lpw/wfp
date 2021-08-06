import {
	removeRouteQuery,
} from './queries';

export function removeRoute( id ) {
	return new Promise( function( resolve, reject ) {
		removeRouteQuery( id, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
