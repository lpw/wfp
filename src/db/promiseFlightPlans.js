import {
	flightPlansQuery,
	totalStageCountsInPlansQuery,
	approvedStageCountsInPlansQuery,
	flightPlansPointCountQuery
} from './queries'

export function promiseFlightPlans() {
	const flightPlansPromise = new Promise( function( resolve, reject ) {
		flightPlansQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( rows )
		})
	})

	const flightPlansPointCountPromise = new Promise( function( resolve, reject ) {
		flightPlansPointCountQuery( function ( error, rows ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( rows )
		})
	})

	const queryPromise = Promise.all( [ flightPlansPromise, flightPlansPointCountPromise ] )

	return queryPromise.then( ( [ flightPlans = [], flightPlansPointCount = [] ] ) => {
		const flightPlansPointCountObject = flightPlansPointCount.reduce( ( fps, fp ) => ( { ...fps, [ fp.id ]: fp } ), {} )
		return flightPlans.map( fp => ({
			...fp,
			pointCount: flightPlansPointCountObject[ fp.id ] ? flightPlansPointCountObject[ fp.id ].pointCount : 0
		}))
	})
}
