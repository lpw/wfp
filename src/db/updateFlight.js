import {
	updateFlightQuery,
} from './queries';

// export function updateFlight( id, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi, charge ) {
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

// import {
// 	updateFlightQuery,
// } from './queries';

// Checkpointer
// export function updateFlight( flightId, eta, elapsed, coveredDistance ) {
// 	return new Promise( function( resolve, reject ) {
// 		updateFlightQuery( flightId, eta, elapsed, coveredDistance, function ( error ) {
// 			if ( error ) {
// 				return reject( error ) // throw
// 			}
// 			resolve()
// 		})
// 	})
// }

// export function launchFlight( flightId, atd ) {
// 	return new Promise( function( resolve, reject ) {
// 		launchFlightQuery( flightId, atd, function ( error ) {
// 			if ( error ) {
// 				return reject( error ) // throw
// 			}
// 			resolve()
// 		})
// 	})
// }
