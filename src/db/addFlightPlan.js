import {
	addFlightPlanQuery,
	addFlightPlanQueryText,
	getLastInsertIdQuery
} from './queries';

export function addFlightPlan( name, userId ) {
	return new Promise( function( resolve, reject ) {
		addFlightPlanQuery( name, userId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	}).then( () => {
		return new Promise( function( resolve, reject ) {
			return getLastInsertIdQuery( function ( error, rows ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( rows[ 0 ] )
			})
		})
	})
}
