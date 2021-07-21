import {
	routesQuery,
	// pointsQuery,
} from './queries';

const debug = require('debug')('wfp:db')

const sameFunc = ( a, b ) => a.destination === b.destination && a.altitude === b.altitude && a.speed === b.speed

const sortFunc = ( a, b ) => {
	if( a.destinationCode > b.destinationCode ) {
		return 1
	} else if( a.destinationCode < b.destinationCode ) {
		return -1
	} else if( a.altitude > b.altitude ) {
		return 1
	} else if( a.altitude < b.altitude ) {
		return -1
	} else if( a.speed > b.speed ) {
		return 1
	} else if( a.speed < b.speed ) {
		return -1
	}
	return 0
}

export function promiseRoutes() {
	const routesPromise = new Promise( function( resolve, reject ) {
		routesQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}

			const routes = rows.reduce( ( s, r ) => {
				const existingRoutes = s[ r.origin ] || []
				const routeFound = existingRoutes.find( e => sameFunc( e, r ) )

				if( routeFound ) {
					return s
				} else {
					return {
						...s,
						[ r.origin ]: existingRoutes.concat( r ).sort( sortFunc )
					}
				}
			}, {} )

			resolve( routes )
		})
	})

	return routesPromise
}
