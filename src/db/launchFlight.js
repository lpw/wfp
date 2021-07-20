import {
	launchFlightQuery,
	getLaunchInfoFlightQuery,
	updateAircraftQuery,
} from './queries';

export function launchFlight( flightId ) {
	const launchFlightPromise = new Promise( function( resolve, reject ) {
		launchFlightQuery( flightId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})

	// const launchAircrafttPromise = new Promise( function( resolve, reject ) {
	// 	flightQuery( flightId, function ( error, rows ) {
	// 		if ( error ) {
	// 			return reject( error ) // throw
	// 		}
	// 		const { aircraft, route, altitude, speed } = rows[ 0 ]
	// 		const r = {
	// 			aircraft, route, altitude, speed
	// 		}
	// 		resolve( r )
	// 	}).then( r } => {
	// 		const { aircraft, route, altitude, speed } = r
	// 		routeQuery( route, function ( error, rows ) {
	// 			if ( error ) {
	// 				return reject( error ) // throw
	// 			}
	// 			const { origin, bearing } = rows[ 0 ]
	// 			resolve({
	// 				...r,
	// 				origin,
	// 				bearing,
	// 			})
	// 		}).then( r } => {
	// 			const { origin } = r
	// 			pointQuery( origin, function ( error ) {
	// 				if ( error ) {
	// 					return reject( error ) // throw
	// 				}
	// 				const { lat, lon, elevation } = rows[ 0 ]
	// 				resolve({
	// 					...r,
	// 					lat,
	// 					lon,
	// 					elevation,
	// 				})
	// 			}).then( r => {
	// 				const { aircraft, lat, lon, bearing, speed, altitude } = r
	// 				const rechargedCapacity = 100000
	// 				updateAircraftQuery( aircraft, rechargedCapacity, lat, lon, bearing, speed, altitude, 0, 0, 0, 0, 0, function ( error ) {
	// 					if ( error ) {
	// 						return reject( error ) // throw
	// 					}
	// 					resolve()
	// 				})
	// 			})
	// 		})
	// 	})
	// })

	const launchAircrafttPromise = new Promise( function( resolve, reject ) {
		getLaunchInfoFlightQuery( flightId, function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			// could transition elevation -> altitiude
			const { aircraft, lat, lon, bearing, speed, altitude } = rows[ 0 ]
			const rechargedCapacity = 100000
			updateAircraftQuery( aircraft, rechargedCapacity, lat, lon, bearing, speed, altitude, 0, 0, 0, 0, 0, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve()
			})
		})
	})

	return Promise.all( [ launchFlightPromise, launchAircrafttPromise ] )
}
