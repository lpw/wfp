import {
	updateFlightQuery,
} from './queries';

export function updateFlight( payload ) {
	// const { id, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi, charge } = payload
	return new Promise( function( resolve, reject ) {
		updateFlightQuery( payload, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
