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
		// console.log( 'LANCE fleet.map( f => f.flightId )', fleet.map( f => f.flightId ) )
		fleet.map( f => console.log( 'LANCE fleet flightId', f.flightId ) )
		const rf = fleet.reduce( ( sofar, aircraft ) => {
			const { pointId, ...aWithoutPointId } = aircraft
			const { id, flightId, routeId, baseId, atd, ata, etd, sequence } = aircraft
			const existing = sofar[ id ]

			// if( existing && existing.atd > atd ) {  
			// use existing entry if it's scheduled to depart more recently 
			if( existing && existing.etd > etd ) {  
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
						originId: baseId,
						originCode: points[ baseId ].code, 
						originLat: points[ baseId ].lat,
						originLon: points[ baseId ].lon,
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
						originId: pointId,
						originCode: points[ pointId ].code, 
						originLat: points[ pointId ].lat,
						originLon: points[ pointId ].lon,
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
						destinationId: pointId, 
						destinationCode: points[ pointId ].code, 
						destinationLat: points[ pointId ].lat, 
						destinationLon: points[ pointId ].lon, 
					}
				}
			}
		}, {} )

		// debug( 'rf', rf )
		console.log( 'LANCE rf', rf )

		return rf
	})
}

export const promiseLaunchingFleet = () => promiseFleet( launchingFlightQuery )
export const promiseFlyingFleet = () => promiseFleet( flyingFleetQuery )
