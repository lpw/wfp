import {
	updateLandingAircraftQuery,
} from './queries';

// just a subset of updateAircraft

export function updateLandingAircraft( id, lat, lon, altitude ) {
	return new Promise( function( resolve, reject ) {
		updateLandingAircraftQuery( id, lat, lon, altitude, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
