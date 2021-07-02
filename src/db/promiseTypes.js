import {
	typesQuery,
} from './queries'

export function promiseTypes() {
	const typesPromise = new Promise( function( resolve, reject ) {
		typesQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}

			resolve( rows )
		})
	})

	return typesPromise
}
