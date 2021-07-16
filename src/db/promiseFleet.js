import assert from 'assert'
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

	// return fleetPromise.then( fleet => {
	// 	const routePointsPromises = fleet.map( f => {
	// 		return new Promise( function( resolve, reject ) {
	// 			routePointsQuery( f.route, function ( error, rows ) {
	// 				if ( error ) {
	// 					return reject( error ) // throw
	// 				}
	// 				const f2 = {
	// 					...f,
	// 					...rows[ 0 ] && rows[ 0 ].point && { origin: rows[ 0 ].point },
	// 					...rows[ 1 ] && rows[ 1 ].point && { destination: rows[ 1 ].point },
	// 				}
	// 				resolve( f2 )
	// 			})
	// 		})
	// 	})
	// 	return Promise.all( routePointsPromises )
	// }).then( fleet => {
	// 	return fleet.reduce( ( a, f ) => {
	// 		return ({
	// 			...a,
	// 			[ f.id ]: f,
	// 		})
	// 	}, {})
	// })

	return fleetPromise.then( fleet => {
		return fleet.reduce( ( s, a ) => {
			const { pointId, ...aWithoutPointId } = a
			const id = a.id
			const r = s[ id ]
			if( !r ) {
				assert( a.sequence === 1 || !a.routePointsQuery )
				return {
					...s,
					[ id ]: {
						...aWithoutPointId,
						originId: a.pointId || a.baseId,
					}
				}
			} else {
				// console.log( 'LANCE', a.sequence )
				// console.log( 'LANCE', r.originId )
				// console.log( 'LANCE', r.destinationId )
				// assert( a.sequence > 1 )
				// assert( a.sequence === 2 )
				// assert( r.originId )
				// assert( !r.destinationId )
				if( !( a.sequence > 1 ) ) {
					console.warn( 'promiseFleet 1 a.sequence', a.sequence )
				}
				if( !( a.sequence === 2 ) ) {
					console.warn( 'promiseFleet 2 a.sequence', a.sequence )
				}
				if( !( r.originId ) ) {
					console.warn( 'promiseFleet r.originId', r.originId )
				}
				if( !( !r.destinationId ) ) {
					console.warn( 'promiseFleet r.destinationId', r.destinationId )
				}
				return {
					...s,
					[ id ]: {
						...r,	
						destinationId: a.pointId, 
					}
				}
			}
		}, {} )
	})
}
