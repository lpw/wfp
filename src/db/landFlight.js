import {
	landFlightQuery,
	landFlightNowQuery,
	// getlandInfoFlightQuery,
	// updateAircraftQuery,
} from './queries';

export function landFlight( flightId, ata ) {
	return new Promise( function( resolve, reject ) {
		landFlightQuery( flightId, ata, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}

export function landFlightNow( flightId ) {
	return new Promise( function( resolve, reject ) {
		landFlightNowQuery( flightId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}



// import {
// 	landFlightQuery,
// 	getLandInfoFlightQuery,
// 	updateAircraftLandQuery,
// } from './queries';

// export function landFlight( flightId ) {
// 	const landFlightPromise = new Promise( function( resolve, reject ) {
// 		landFlightQuery( flightId, function ( error ) {
// 			if ( error ) {
// 				return reject( error ) // throw
// 			}
// 			resolve()
// 		})
// 	})

// 	const landAircrafttPromise = new Promise( function( resolve, reject ) {
// 		getLandInfoFlightQuery( flightId, function ( error, rows ) {
// 			if ( error ) {
// 				return reject( error ) // throw
// 			}
// 			const { aircraft, lat, lon, elevation } = rows[ 0 ]
// 			updateAircraftLandQuery( aircraft, lat, lon, elevation, function ( error ) {
// 				if ( error ) {
// 					return reject( error ) // throw
// 				}
// 				resolve()
// 			})
// 		})
// 	})

// 	return Promise.all( [ landFlightQuery, landAircrafttPromise ] )
// }

// // import {
// // 	landFlightQuery,
// // 	getLandInfoFlightQuery,
// // 	updateAircraftLandQuery,
// // } from './queries';

// // export function launchFlightNow( flightId ) {
// // 	return new Promise( function( resolve, reject ) {
// // 		launchFlightNowQuery( flightId, function ( error ) {
// // 			if ( error ) {
// // 				return reject( error ) // throw
// // 			}
// // 			resolve()
// // 		})
// // 	})
// // }

// // // export function landFlight( flightId ) {
// // // 	const landFlightPromise = new Promise( function( resolve, reject ) {
// // // 		landFlightQuery( flightId, function ( error ) {
// // // 			if ( error ) {
// // // 				return reject( error ) // throw
// // // 			}
// // // 			resolve()
// // // 		})
// // // 	})

// // // 	const landAircrafttPromise = new Promise( function( resolve, reject ) {
// // // 		getLandInfoFlightQuery( flightId, function ( error, rows ) {
// // // 			if ( error ) {
// // // 				return reject( error ) // throw
// // // 			}
// // // 			const { aircraft, lat, lon, elevation } = rows[ 0 ]
// // // 			updateAircraftLandQuery( aircraft, lat, lon, elevation, function ( error ) {
// // // 				if ( error ) {
// // // 					return reject( error ) // throw
// // // 				}
// // // 				resolve()
// // // 			})
// // // 		})
// // // 	})

// // // 	return Promise.all( [ landFlightQuery, landAircrafttPromise ] )
// // // }
