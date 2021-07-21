import {
	updateRouteDistanceQuery,
	updateRouteBearingQuery,
} from './queries';

export function updateRouteDistance( flightId, distance ) {
	return new Promise( function( resolve, reject ) {
		updateRouteDistanceQuery( flightId, distance, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}

export function updateRouteBearing( flightId, bearing ) {
	return new Promise( function( resolve, reject ) {
		updateRouteBearingQuery( flightId, bearing, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
