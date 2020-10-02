import {
	usersQuery,
} from './queries';

export function promiseUsers() {
	const usersPromise = new Promise( function( resolve, reject ) {
		usersQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}

			resolve( rows )
		})
	})

	return usersPromise
}
