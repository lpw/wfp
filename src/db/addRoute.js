import {
	addRouteToRoutesQuery,
	getLastInsertIdQuery,
	addPointToRouteQuery,
} from './queries'

/*
export function addRoute( payload ) {
	const addRoutePromise = new Promise( function( resolve, reject ) {
		addRouteQuery( payload, function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
	return addRoutePromise
}
*/

export function addRoute( { origin, destination, altitude, speed } ) {
	return new Promise( function( resolve, reject ) {
		addRouteToRoutesQuery( altitude, speed, function ( error ) {
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
			addPointToRouteQuery( routeId, 1, origin, altitude, speed, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( routeId )
			})
		})
	}).then( routeId => {
		return new Promise( function( resolve, reject ) {
			addPointToRouteQuery( routeId, 2, destination, altitude, speed, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( routeId )
			})
		})
	})
}
