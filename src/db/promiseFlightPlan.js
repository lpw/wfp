import {
	flightPlanQuery,
	routesAndPointsOfFlightPlanQuery,
	pointsOfFlightPlanQuery,
} from './queries'

export function promiseFlightPlan( id ) {
	const flightPlanPromise = new Promise( function( resolve, reject ) {
		flightPlanQuery( id, function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( rows[ 0 ] )
		})
	})

	const routesAndPointsOfFlightPlanPromise = new Promise( function( resolve, reject ) {
		routesAndPointsOfFlightPlanQuery( id, function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}

			resolve( rows )
		})
	})

	const queryPromise = Promise.all( [ flightPlanPromise, routesAndPointsOfFlightPlanPromise ] )

	return queryPromise.then( ( [ flightPlan = {}, routesAndPoints = [] ] ) => {
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
			flightPlan: {
				...flightPlan,
				routeIds
			},
			routes: routesWithPointIds,
			points,
		}
	})
}
