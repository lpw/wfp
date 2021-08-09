import assert from 'assert'
import {
	fleetQuery,
	launchingFlightQuery,
	flyingFleetQuery,
} from './queries'
import {
	promisePoints,
} from './'
const debug = require('debug')('wfp:sim')
debug.enabled = false

const a1_bt_a2 = -1
const a2_bt_a1 = 1
const a1_eq_a2 = 0

const compareTimes = ( t1, t2 ) => {
	// later/larger times ordered first, better than (in this case, also greater than)
	if( t1 > t2 ) {
		return a1_bt_a2
	}
	if( t1 < t2 ) {
		return a2_bt_a1
	}
	return a1_eq_a2
}

// too complicated to express in sql  
const sortFlightsAndRoutePoints = ( frp1, frp2 ) => {
	const { etd: etd1, atd: atd1, ata: ata1, seq: seq1 } = frp1
	const { etd: etd2, atd: atd2, ata: ata2, seq: seq2 } = frp2

	if( atd1 && atd2 ) {
		// both have departed
		if( !ata1 && !ata2 ) {
			// neither have arrived, compare departure times
			const ct = compareTimes( atd1, atd2 )
			if( ct !== a1_eq_a2 ) {
				return ct
			}
		}
		if( ata1 && !ata2 ) {
			// 1 has arrived, but not 2, so 2 most important
			return a2_bt_a1
		}
		if( !ata1 && ata2 ) {
			// 2 has arrived, but not 1, so 1 most important
			return a1_bt_a2
		}
		// both have arrived, compare subsequent criteria
		// might be two points in same flight (not returned from above time comparison)
		// assert( !ata1 && !ata2 )
	}

	if( atd1 && !atd2 ) {
		// 1 has departed, but not 2
		assert( !ata2 )	// 2 can't have arrived without having departed
		if( ata1 ) {
			// 1 has arrived, not 2 of course (hasn't departed) 
			if( etd2 ) {
				// but if 2 has an etd, it's more relevant
				return a2_bt_a1
			}
			if( !etd2 ) {
				// but if 2 does not have an etd, the arrived 1 is more relevant
				return a1_bt_a2
			}
		}
		assert( !ata1 )	// otherwise would've followed above block
		// 1 has departed but not arrived, it's more relevant in the air
		return a1_bt_a2
	}


	if( !atd1 && atd2 ) {
		// 2 has departed, but not 1
		assert( !ata1 )	// 1 can't have arrived without having departed
		if( ata2 ) {
			// 2 has arrived, not 1 of course (hasn't departed) 
			if( etd1 ) {
				// but if 1 has an etd, it's more relevant
				return a1_bt_a2
			}
			if( !etd1 ) {
				// but if 1 does not have an etd, the arrived 2 is more relevant
				return a2_bt_a1
			}
		}
		assert( !ata2 )	// otherwise would've followed above block
		// 2 has departed but not arrived, it's more relevant in the air
		return a2_bt_a1
	}

	if( !atd1 && !atd2 ) {
		// neither have departed,
		if( etd1 && etd2 ) {
			// both are estimated to depart
			const ct = compareTimes( etd1, etd2 )
			if( ct !== a1_eq_a2 ) {
				return ct
			}
		}
		if( etd1 && !etd2 ) {
			// 1 is expected to depart, not 2, so 1 more relevant
			return a1_bt_a2
		}
		if( !etd1 && etd2 ) {
			// 2 is expected to depart, not 1, so 2 more relevant
			return a2_bt_a1
		}
		// neither are estimated to depart, but might be two points in same flight
		// assert( !etd1 && !etd2 )
	}

	// all else same, must be same flight, but differrent sequence point
	// make lower sequence come first to count as origin, and later sequences as destinations
	if( seq1 < seq2 ) {
		// this is proper, to have a lower sequence higher in the order
		return a1_bt_a2
	}
	if( seq1 > seq2 ) {
		// this is improper, so rerturn reorder
		return a2_bt_a1
	}

	// treat as equal as no other criteria to compare
	return a1_eq_a2
}

const getAircraftWithBestFlightAndRoutePoints = ( id, fleetWithFlightsAndRoutePoints, points ) => {
	assert( id )

	let aircraftWithBestFlightAndRoutePoints = {}

	const aircraftWithFlightsAndRoutePoints = fleetWithFlightsAndRoutePoints.filter( f => f.id === id )

	if( aircraftWithFlightsAndRoutePoints.length > 0 ) {
		const sortedFlightsAndRoutePoints = aircraftWithFlightsAndRoutePoints.sort( sortFlightsAndRoutePoints )

		assert( sortedFlightsAndRoutePoints.length > 0 )

		const { flightId } = sortedFlightsAndRoutePoints[ 0 ]

		// assert( flightId ) may be and okay to be null

		const flightAndRoutePoints = sortedFlightsAndRoutePoints.filter( f => f.flightId === flightId )

		assert( flightAndRoutePoints.length > 0 )

		for( let i = 0 ; i < flightAndRoutePoints.length ; i++ ) {
			const aircraftWithPointId = flightAndRoutePoints[ i ]
			const { id, lat, lon, flightId, routeId, baseId, atd, sequence } = aircraftWithPointId
			// use base for/with no pointId in case of a flight with no roughts (shouldnn't happen normally though)
			// also have cleaner data structure with origiin and destination instead of pointId
			let { pointId, ...aircraft } = aircraftWithPointId  
			// because default destructure assignments like pointId = baseId only work with undefined and not null
			if( !pointId ) {
				pointId = baseId
			}

			// assert( pointId ) may be and okay to be null

			if( !aircraftWithBestFlightAndRoutePoints.id ) {
				aircraftWithBestFlightAndRoutePoints = {
					...aircraft,

					// includes baseId,

					...baseId && points[ baseId ] && {
						baseCode: points[ baseId ].code, 
						baseLat: points[ baseId ].lat,
						baseLon: points[ baseId ].lon,
					},

					...pointId && points[ pointId ] && {
						// query results ordered so that first point in route has lowerr sequence/origin
						originId: pointId,
						originCode: points[ pointId ].code, 
						originLat: points[ pointId ].lat,
						originLon: points[ pointId ].lon,
					},

					lat: lat || ( pointId && points[ pointId ] ? points[ pointId ].lat : null ),
					lon: lon || ( pointId && points[ pointId ] ? points[ pointId ].lon : null ),
				}
			} else {
				assert( sequence > 1 )
				assert( sequence === 2 )
				assert( aircraftWithBestFlightAndRoutePoints.id === id )
				assert( aircraftWithBestFlightAndRoutePoints.originId )
				assert( aircraftWithBestFlightAndRoutePoints.originId !== pointId )
				assert( aircraftWithBestFlightAndRoutePoints.baseId === baseId )
				assert( !aircraftWithBestFlightAndRoutePoints.destinationId )
				assert( aircraftWithBestFlightAndRoutePoints.flightId === flightId )
				assert( aircraftWithBestFlightAndRoutePoints.routeId === routeId )
				assert( aircraftWithBestFlightAndRoutePoints.atd === atd )

				aircraftWithBestFlightAndRoutePoints = {
					...aircraftWithBestFlightAndRoutePoints,

					...pointId && points[ pointId ] && {
						// will override any previous entries 
						destinationId: pointId, 
						destinationCode: points[ pointId ].code, 
						destinationLat: points[ pointId ].lat, 
						destinationLon: points[ pointId ].lon, 
						destinationElevation: points[ pointId ].elevation, 
					},
				}
			}
		}
	}

	return aircraftWithBestFlightAndRoutePoints
}

export function promiseFleet( query = fleetQuery, filterFunc = () => true ) {
	const fleetPromise = new Promise( function( resolve, reject ) {
		query( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			// resolve( rows.filter( filterFunc ) ) too early, no pointIds yet
			resolve( rows )
		})
	})

	const pointsPromise = promisePoints()	// cached

	return Promise.all( [ fleetPromise, pointsPromise ] ).then( ( [ fleetWithFlightsAndRoutePoints, points ] ) => {
		// resolve fleets with flights and routs along with points per huestrics of depatrure and arrival estimats and actuals (landing and taking-off)
		const rf = fleetWithFlightsAndRoutePoints.reduce( ( sofar, aircraft ) => {
			const { id } = aircraft
			const aircraftWithBestFlightAndRoutePoints = getAircraftWithBestFlightAndRoutePoints( id, fleetWithFlightsAndRoutePoints, points )
			const moreFar = {
				...sofar,
				...filterFunc( aircraftWithBestFlightAndRoutePoints ) && { [ id ]: aircraftWithBestFlightAndRoutePoints }
			}
			return moreFar
		}, {} )
		
		debug( 'rf', rf )

		return rf
	})
}

export const promiseLaunchingFleet = () => promiseFleet( launchingFlightQuery, a => a.originId && a.destinationId )
export const promiseFlyingFleet = () => promiseFleet( flyingFleetQuery, a => a.destinationId )
