import {
	updateAircraftQuery,
} from './queries';

export function updateAircraft( id, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi, charge ) {
	return new Promise( function( resolve, reject ) {
		updateAircraftQuery( id, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi, charge, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
