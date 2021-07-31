import assert from 'assert'
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
				const { 
					sequence, 
					id, 
					pointId, 
					pointCode,
					altitude,
					speed,
					distance,
					bearing,
				} = r 

				if( sequence === 1 ) {
					return {
						...s,
						[ id ] : {
							id,
							altitude,
							speed,
							distance,
							bearing,
							originId: pointId,
							originCode: pointCode,
						}
					}
				} else if( sequence > 1 ) {
					assert( r.id === s[ id ].id )
					assert( r.altitude === s[ id ].altitude )
					assert( r.speed === s[ id ].speed )
					assert( r.distance === s[ id ].distance )
					assert( r.bearing === s[ id ].bearing )
					return {
						...s,
						[ id ] : {
							...s[ id ],
							destinationId: pointId,
							destinationCode: pointCode,
						}
					}
				}
			}, {} )

			const routesByOrigin = Object.keys( routes ).map( k => routes[ k ] ).reduce( ( s, r ) => {
				const existingRoutes = s[ r.originId ] || []
				const routeFound = existingRoutes.find( e => sameFunc( e, r ) )

				if( routeFound ) {
					return s
				} else {
					return {
						...s,
						[ r.originId ]: existingRoutes.concat( r ).sort( sortFunc )
					}
				}
			}, {} )

			resolve( routesByOrigin )
		})
	})

	return routesPromise
}
