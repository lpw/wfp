import {
	addRouteQuery,
	getLastInsertIdQuery,
	addRouteToAircraft,
} from './queries'

export function addFlightRoute( aircraft, origin, destination, altitude, speed, charge ) {
	return new Promise( function( resolve, reject ) {
		addRouteQuery( origin, destination, altitude, speed, charge, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}

			resolve()
		})
	}).then( () => {
		return new Promise( function( resolve, reject ) {
			return getLastInsertIdQuery( function ( error, rows ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( rows[ 0 ].id )
			})
		})
	}).then( routeId => {
		return new Promise( function( resolve, reject ) {
			addRouteToAircraft( aircraft, routeId, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}

				resolve( routeId )
			})
		})
	})
}
