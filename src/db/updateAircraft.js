import {
	updateAircraftQuery,
} from './queries';

export function updateAircraft( payload ) {
	// const { id, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi, charge } = payload
	return new Promise( function( resolve, reject ) {
		updateAircraftQuery( payload, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
