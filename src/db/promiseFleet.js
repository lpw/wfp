import {
	fleetQuery,
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

	// const pointsPromise = new Promise( function( resolve, reject ) {
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

	return fleetPromise
}
