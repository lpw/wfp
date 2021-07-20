import {
	landFlightQuery,
	getLandInfoFlightQuery,
	updateAircraftLandQuery,
} from './queries';

export function landFlight( flightId ) {
	const landFlightPromise = new Promise( function( resolve, reject ) {
		landFlightQuery( flightId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})

	const landAircrafttPromise = new Promise( function( resolve, reject ) {
		getLandInfoFlightQuery( flightId, function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			const { aircraft, lat, lon, elevation } = rows[ 0 ]
			updateAircraftLandQuery( aircraft, lat, lon, elevation, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve()
			})
		})
	})

	return Promise.all( [ landFlightQuery, landAircrafttPromise ] )
}
