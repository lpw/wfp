import {
	addFlightQuery,
	addRouteQuery,
	addPointToRouteQuery,
	getLastInsertIdQuery,
} from './queries';
const debug = require('debug')('wfp:sim')

export function addFlight( aircraftId, originId, destinationId, altitude, speed, charge ) {

	// todo: add bearing and distance from origin to destination into table
	// const bearDistPromise = new Promise( function( resolve, reject ) {
	// 	bearDistQuery( aircraftId, destinationId, altitude, speed, charge, function ( error ) {
	// 		if ( error ) {
	// 			return reject( error ) // throw
	// 		}
	// 		resolve()
	// 	})
	// }).then( () => {
	// 	return new Promise( function( resolve, reject ) {
	// 		return getLastInsertIdQuery( function ( error, rows ) {
	// 			if ( error ) {
	// 				return reject( error ) // throw
	// 			}
	// 			resolve( rows[ 0 ] )
	// 		})
	// 	})
	// })

	// todo: reuse routes
	// todo: there's two getLastInsertIdQuery running in parallel, can they get swapped?

	const routePromise = new Promise( function( resolve, reject ) {
		addRouteQuery( originId, destinationId, altitude, speed, function ( error ) {
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
	})

	const flightPromise = routePromise.then( routeId => {
		return new Promise( function( resolve, reject ) {
			return addFlightQuery( aircraftId, routeId, altitude, speed, function ( error ) {
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
		})
	})

	const routesPointsPromise = routePromise.then( routeId => {
		const originPromise = new Promise( function( resolve, reject ) {
			return addPointToRouteQuery( routeId, 1, originId, altitude, speed, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( routeId )
			})
		})

		const destinationPromise = new Promise( function( resolve, reject ) {
			return addPointToRouteQuery( routeId, 2, destinationId, altitude, speed, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( routeId )
			})
		})

		return Promise.all( [ originPromise, destinationPromise ] )
	})

	// return Promise.all( [ flightPromise, routesPointsPromise ] ).then( ( [ flightId, nada ] ) => flightId )
	return Promise.all( [ flightPromise, routesPointsPromise ] 
	).then( ( [ flightId, nada ] ) => {
		debug( 'flightId', flightId )
		return flightId
	})
}
