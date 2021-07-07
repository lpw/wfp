import {
	flightsQuery,
} from './queries'

export function promiseFlights() {
	const flightsPromise = new Promise( function( resolve, reject ) {
		flightsQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( rows )
		})
	})

	// const aircraftPromise = new Promise( function( resolve, reject ) {
	// 	aircraftQuery( function ( error, rows ) {
	// 		if ( error ) {
	// 			return reject( error ) // throw
	// 		}
	// 		resolve( rows )
	// 	})
	// })

	// const routesPromise = new Promise( function( resolve, reject ) {
	// 	aircraftQuery( function ( error, rows ) {
	// 		if ( error ) {
	// 			return reject( error ) // throw
	// 		}
	// 		resolve( rows )
	// 	})
	// })

	// const flightsPointCountPromise = new Promise( function( resolve, reject ) {
	// 	flightsPointCountQuery( function ( error, rows ) {
	// 		if ( error ) {
	// 			return reject( error ) // throw
	// 		}
	// 		resolve( rows )
	// 	})
	// })

	// const queryPromise = Promise.all( [ flightsPromise, aircraftPromise, routesPromise ] )

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

	return flightsPromise
}
