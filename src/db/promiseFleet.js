import {
	fleetQuery,
	routePointsQuery,
} from './queries'

export function promiseFleet() {
	const fleetPromise = new Promise( function( resolve, reject ) {
		fleetQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( rows )
		})
	})

	// const routePointsQuery = new Promise( function( resolve, reject ) {
	// 	pointsQuery( function ( error, rows ) {
	// 		if ( error ) {
	// 			return reject( error ) // throw
	// 		}
	// 		resolve( rows )
	// 	})
	// })

	// const routesPromise = new Promise( function( resolve, reject ) {
	// 	routesQuery( function ( error, rows ) {
	// 		if ( error ) {
	// 			return reject( error ) // throw
	// 		}
	// 		resolve( rows )
	// 	})
	// })

	// const queryPromise = Promise.all( [ fleetPromise, pointsPromise, routesPromise ] )

	// return queryPromise.then( ( [ flights = [], aircraft = [], flightsPointCount = [] ] ) => {
	// 	const flightsAircraftObject = flightsPointCount.reduce( ( fps, fp ) => ( { ...fps, [ fp.id ]: fp } ), {} )
	// 	const flightsPointCountObject = flightsPointCount.reduce( ( fps, fp ) => ( { ...fps, [ fp.id ]: fp } ), {} )
	// 	return flights.map( fp => ({
	// 		...fp,
	// 		aircraft: 
	// 		pointCount: flightsPointCountObject[ fp.id ] ? flightsPointCountObject[ fp.id ].pointCount : 0
	// 		// distance
	// 	}))
	// })

	return fleetPromise.then( fleet => {
		const routePointsPromises = fleet.map( f => {
			return new Promise( function( resolve, reject ) {
				routePointsQuery( f.route, function ( error, rows ) {
					if ( error ) {
						return reject( error ) // throw
					}
					const f2 = {
						...f,
						...rows[ 0 ] && rows[ 0 ].point && { origin: rows[ 0 ].point },
						...rows[ 1 ] && rows[ 1 ].point && { destination: rows[ 1 ].point },
					}
					resolve( f2 )
				})
			})
		})
		return Promise.all( routePointsPromises )
	}).then( fleet => {
		return fleet.reduce( ( a, f ) => {
			return ({
				...a,
				[ f.id ]: f,
			})
		})
	})
}
