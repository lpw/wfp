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
			// if( existing && existing.etd > etd ) {  
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
			// 	existing.atd > atd && !existing.ata ||	// existing has left later but not landed
			// 	!atd && existing.etd > etd
			// )) {  // the existing entry is newer than the current aircraft entry/row

			/*
			// flight1 is the existing entry, flight2 is the candidate entry

			ata1 > ata2 1
			null   ata2 1
			ata1   null 2
			null   null ?

			// eta1 > eta2 1
			// null   eta2 ?
			// eta1   null ?
			// null   null ?

			atd1 > atd2 1
			null   atd2 2
			atd1   null 1
			null   null ?

			etd1 > etd2 1
			null   etd2 2
			etd1   null 1
			null   null ?
			*/

			// const ata1 = existing && existing.ata
			// const atd1 = existing && existing.atd
			// const etd1 = existing && existing.etd

			// const ata2 = ata
			// const atd2 = atd
			// const etd2 = etd

			// let flight1 = false

			// if( 
			// 	ata1 && ata2 && ata1 > ata2 ||	// flight1 has landed after flight2
			// 	!ata1 && ata2 	// flight1 has not landed but flight2 has landed
			// ) {  
			// 	flight1 = true
			// } else if( // neither plan has landed, but 
			// 	atd1 && atd2 && atd1 > atd2 ||	// flight1 took-off most recently
			// 	atd1 && !atd2 	// flight1 took-off while flight2 has not taken-off
			// ) {  
			// 	flight1 = true
			// } else if( // neither plan has taken-off, but
			// 	etd1 && etd2 && etd1 > etd2 ||	// flight1 is estimated to leave later than flight2
			// 	etd1 && !etd1 	// flight1 has an estimate to leave while flight2 does not have an estimate
			// ) {  
			// 	flight1 = true
			// }

			let flight1 = false	// presume the eixsting flight, flight1, is not better than the candidate aircraft entry

			if( existing ) {
				const ata1 = existing.ata
				const atd1 = existing.atd
				const etd1 = existing.etd

				const ata2 = ata
				const atd2 = atd
				const etd2 = etd

				if(
					ata1 && ata2 && ata1 > ata2 ||	// both flights have landed, flight1 has landed after flight2,
					!ata1 && ata2 	// flight1 has not landed but flight2 has landed
				) {  
					flight1 = true
				} else if( 	// neither flight has landed, 
					!ata1 && !ata2 && atd1 && atd2 && atd1 > atd2 ||	// both have taken-off, flight1 took-off most recently
					!ata1 && !ata2 && atd1 && !atd2 	// light1 took-off while flight2 has not taken-off
				) {  
					flight1 = true
				} else if( // neither plan has lsnded, nor taken-off,
					!ata1 && !ata2 && !atd1 && !atd2 && etd1 && etd2 && etd1 > etd2 ||	// flight1 is estimated to leave later than flight2
					!ata1 && !ata2 && !atd1 && !atd2 && etd1 && !etd1 	// flight1 has an estimate to leave while flight2 does not have an estimate
				) {  
					flight1 = true
				}
			}

			if( flight1 ) {
				return sofar
			} else if( !sequence ) {  
				// no flight
				assert( !sequence )
				assert( !pointId )
				assert( baseId )
				// assert( !flightId )
				if( flightId ) {
					console.warn( 'surprised to get a flight with no sequence sequence' )
				}
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
				// first point of flight (or landed, in which case there's no more destination, or ratherr the destination has become the origin
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
