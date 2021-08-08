import {
	addAircraftQuery,
	getLastInsertIdQuery,
} from './queries';
import {
	addRoute,
	addFlight,
} from './';

export function addAircraftRouteFly( { name, origin, destination, altitude, speed } ) {
	// could reeuse ./addAircraft
	const addAircraftPromise = new Promise( function( resolve, reject ) {
		addAircraftQuery( name, origin, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})

	const getLastInsertIdPromise = addAircraftPromise.then( () => {
		return new Promise( function( resolve, reject ) {
			return getLastInsertIdQuery( function ( error, rows ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( rows[ 0 ].id )
			})
		})
	})

	// // this could go in parallel with the aircraft promise, but getLastInsertId is needed for aircraftId
	// const addRoutePromise = addRoute( { origin, destination, altitude, speed } ) 

	// const aircraftAndRoutPromise = Promise.all( [ getLastInsertIdPromise, addRoutePromise ] ) 

	return getLastInsertIdPromise.then( aircraftId => {
		const addRoutePromise = addRoute( { origin, destination, altitude, speed } ) 

		addRoutePromise.then( routeId => {
			return addFlight( aircraftId, routeId )
		})
	})
}
