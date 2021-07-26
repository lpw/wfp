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

export function promiseFleet( query = fleetQuery ) {
	const fleetPromise = new Promise( function( resolve, reject ) {
		query( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( rows )
		})
	})

	const pointsPromise = promisePoints()	// cached

	return Promise.all( [ fleetPromise, pointsPromise ] ).then( ( [ fleet, points ] ) => {
		const rf = fleet.reduce( ( sofar, aircraft ) => {
			const { pointId, ...aWithoutPointId } = aircraft
			const { id, lat, lon, flightId, routeId, baseId, atd, ata, etd, sequence } = aircraft
			const existing = sofar[ id ]

			// // if( existing && existing.atd > atd ) {  
			// // if( existing && existing.etd > etd ) {  
			// // use existing entry if it's departed before this one, or scheduled to depart more recently 
			// if( existing && (
			// 	( atd && existing.atd > atd ) ||
			// 	// ( !existing.atd && existing.etd > etd )
			// 	// ( existing.atd && existing.etd > etd )
			// 	( !atd && existing.etd > etd )
			if( existing && existing.etd > etd ) {  
			// if( existing && (
			// 	existing.atd && atd && existing.atd > atd ||
			// 	existing.atd && !atd ||	// shouldn't be necessary as above catches this condition
			// 	existing.etd && etd && existing.etd > etd ||
			// 	existing.etd && !etd // shouldn't happen, and shouldn't be necessary as above catches this condition
			// )) {  
			// if( existing && (
			// 	existing.atd && existing.atd > atd ||
			// 	!existing.atd && !atd && existing.etd & existing.etd > etd ||
			// 	existing.etd && !etd // shouldn't happen, and shouldn't be necessary as above catches this condition
			// )) {  

			// if( existing && (
			// 	existing.atd > atd ||
			// 	!atd && existing.etd > etd
			// )) {  
				// the existing entry is newer than the current aircraft entry/row
				return sofar
			} else if( !sequence ) {  
				// no flight
				assert( !sequence )
				assert( !flightId )
				assert( !pointId )
				assert( baseId )
				return {
					...sofar,
					[ id ]: {
						...aWithoutPointId,
						baseId: baseId,
						baseCode: points[ baseId ].code, 
						baseLat: points[ baseId ].lat,
						baseLon: points[ baseId ].lon,
						originId: baseId,
						originCode: points[ baseId ].code, 
						originLat: points[ baseId ].lat,
						originLon: points[ baseId ].lon,
						lat: lat || points[ baseId ].lat,
						lon: lon || points[ baseId ].lon,
					}
				}
			} else if( sequence <= 1 || ata ) {
				// first point of flight (or landed)
				assert( sequence === 1 || ata )
				assert( flightId )
				assert( pointId )
				return {
					...sofar,
					[ id ]: {
						...aWithoutPointId,
						baseId: baseId,
						baseCode: points[ baseId ].code, 
						baseLat: points[ baseId ].lat,
						baseLon: points[ baseId ].lon,
						originId: pointId,
						originCode: points[ pointId ].code, 
						originLat: points[ pointId ].lat,
						originLon: points[ pointId ].lon,
						lat: lat || points[ baseId ].lat,
						lon: lon || points[ baseId ].lon,
					}
				}
			} else {  
				// subsequent point od flight (and last since now only handling two-point flights
				assert( sequence > 1 )
				assert( sequence === 2 )
				assert( flightId )
				assert( pointId )

				if( !existing ) {
					console.warn( 'surprised to get no existing entry with advanced sequence' )
				} else {
					if( !existing.originId ) {
						console.warn( 'surprised to get no originId with existing entry advanced sequence' )
					}
					if( existing.destinationId ) {
						console.warn( 'surprised to get destinationId with existing entry advanced sequence', existing.destinationId )
					}
					if( existing.flightId !== flightId ) {
						console.warn( 'surprised to get different flights with existing entry advanced sequence', existing.flightId, flightId )
					}
					if( existing.routeId !== routeId ) {
						console.warn( 'surprised to get different routes with existing entry advanced sequence', existing.routeId, routeId )
					}
					if( existing.atd !== atd ) {
						console.warn( 'surprised to get different atd with existing entry advanced sequence', existing.atd, atd )
					}
				}

				return {
					...sofar,
					[ id ]: {
						...existing,	
						baseId: baseId,
						baseCode: points[ baseId ].code, 
						baseLat: points[ baseId ].lat,
						baseLon: points[ baseId ].lon,
						destinationId: pointId, 
						destinationCode: points[ pointId ].code, 
						destinationLat: points[ pointId ].lat, 
						destinationLon: points[ pointId ].lon, 
						lat: lat || points[ baseId ].lat,
						lon: lon || points[ baseId ].lon,
					}
				}
			}
		}, {} )

		debug( 'rf', rf )

		return rf
	})
}

export const promiseLaunchingFleet = () => promiseFleet( launchingFlightQuery )
export const promiseFlyingFleet = () => promiseFleet( flyingFleetQuery )
