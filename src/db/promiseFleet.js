import assert from 'assert'
import {
	fleetQuery,
	readyFleetQuery,
	flyingFleetQuery,
} from './queries'
import {
	promisePoints,
} from './'

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
		return fleet.reduce( ( s, a ) => {
			const { pointId, ...aWithoutPointId } = a
			const id = a.id
			const r = s[ id ]
			if( !r ) {
				let pointId
				assert( a.sequence === 1 || !a.routePointsQuery )
				if( a.pointId ) {
					pointId = a.pointId
				} else {
					pointId = a.baseId
				}
				assert( pointId )
				return {
					...s,
					[ id ]: {
						...aWithoutPointId,
						originId: pointId,
						originCode: points[ pointId ].code, 
						originLat: points[ pointId ].lat,
						originLon: points[ pointId ].lon,
					}
				}
			} else {
				console.warn( a.sequence > 1 )
				console.warn( a.sequence === 2 )
				console.warn( r.originId )
				console.warn( !r.destinationId )
				console.warn( r.flightId === a.flightId )
				console.warn( r.routeId === a.routeId )
				console.warn( r.etd === a.etd )
				console.warn( r.eta === a.eta )
				console.warn( r.atd === a.atd )
				console.warn( r.ata === a.ata )
				return {
					...s,
					[ id ]: {
						...r,	
						destinationId: a.pointId, 
						destinationCode: points[ pointId ].code, 
						destinationLat: points[ pointId ].lat, 
						destinationLon: points[ pointId ].lon, 
					}
				}
			}
		}, {} )
	})
}

export const promiseReadyFleet = () => promiseFleet( readyFleetQuery )
export const promiseFlyingFleet = () => promiseFleet( flyingFleetQuery )
