import {
	updateAircraftQuery,
} from './queries';

export function updateAircraft( aircraftId, charge, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi ) {
	return new Promise( function( resolve, reject ) {
		updateAircraftQuery( aircraftId, charge, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
