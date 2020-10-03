import {
	deleteFlightPlanQuery,
} from './queries';

export function deleteFlightPlan( id ) {
	return new Promise( function( resolve, reject ) {
		deleteFlightPlanQuery( id, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
