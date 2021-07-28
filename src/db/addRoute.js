import {
	addRouteToRoutesQuery,
	addRouteToFlightsQuery,
	addPointToPointsQuery,
	addPointToRouteQuery,
	getLastInsertIdQuery,
	pointsQuery,
	pointTypesQuery,
} from './queries'

export function addRoute( flightId, path, altitude, speed ) {
	// const getPointsPromise = Promise.all( Object.values( getPointsFromPath( path ) ) )  // no longer a promise
	const getPointsPromise = new Promise( function( resolve, reject ) {
		pointsQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}

			resolve( rows )
		})
	})

	const addRoutePromise = new Promise( function( resolve, reject ) {
		addRouteToRoutesQuery( path, altitude, speed, function ( error ) {
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
			addRouteToFlightsQuery( flightId, routeId, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}

				resolve( routeId )
			})
		})
	})

	const queryPromise = Promise.all( [ getPointsPromise, addRoutePromise ] )

	return queryPromise.then( ( [ pointsWithTypesAndId, routeId ] ) => {
		// const addPointToPointsPromises = Object.values( pointsWithTypes ).map( pointWithType => {
		// 	const { name, code, type, lat, lon, elevation } = pointWithType
		// 	return new Promise( function( resolve, reject ) {
		// 		addPointToPointsQuery( name, code, type, lat, lon, elevation, function ( error, compoundRows ) {
		// 			if ( error ) {
		// 				return reject( error ) // throw
		// 			}
		// 			resolve({
		// 				...pointWithType,
		// 				id: compoundRows[ 1 ][ 0 ].id
		// 			})
		// 		})
		// 	})
		// })
		// return Promise.all( addPointToPointsPromises ).then( pointsWithTypesAndId => {
			const addPointToRoutePromises = Object.values( pointsWithTypesAndId ).map( ( { id: pointId } ) => {
				return new Promise( function( resolve, reject ) {
					addPointToRouteQuery( routeId, pointId, function ( error ) {
						if ( error ) {
							return reject( error ) // throw
						}
						resolve()
					})
				})
			return Promise.all( addPointToRoutePromises )
			})
		// })
	})
}
