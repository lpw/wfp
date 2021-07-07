import {
	flightQuery,
	routesAndPointsOfFlightQuery,
	pointsOfFlightQuery,
} from './queries'

export function promiseFlight( id ) {
	const flightPromise = new Promise( function( resolve, reject ) {
		flightQuery( id, function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( rows[ 0 ] )
		})
	})

	const routesAndPointsOfFlightPromise = new Promise( function( resolve, reject ) {
		routesAndPointsOfFlightQuery( id, function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}

			resolve( rows )
		})
	})

	const queryPromise = Promise.all( [ flightPromise, routesAndPointsOfFlightPromise ] )

	return queryPromise.then( ( [ flight = {}, routesAndPoints = [] ] ) => {
		const routesWithPointIds = routesAndPoints.reduce( ( rps, rp ) => {
			const { route: id, path, altitude, distance, point } = rp
			const existingRouteWithPoints = rps[ id ]
			return {
				...rps,
				[ id ]: {
					...existingRouteWithPoints,
					id,
					path,
					altitude,
					distance,
					pointIds: ( existingRouteWithPoints && existingRouteWithPoints.pointIds || [] ).concat( point )
				}
			}
		}, {} )	
		const points = routesAndPoints.reduce( ( rps, rp ) => {
			const { point: id, name, type, lat, lon, elevation } = rp
			const existingPoint = rps[ id ]
			return {
				...rps,
				[ id ]: {
					...existingPoint,
					id,
					name,
					type,
					lat,
					lon,
					elevation,
				}
			}
		}, {} )	
		const routeIds = Object.keys( routesWithPointIds )
		return {
			flight: {
				...flight,
				routeIds
			},
			routes: routesWithPointIds,
			points,
		}
	})
}
