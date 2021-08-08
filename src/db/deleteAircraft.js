import {
	deleteAircraftQuery,
} from './queries';

export function deleteAircraft( aircraftId ) {
	return new Promise( function( resolve, reject ) {
		deleteAircraftQuery( aircraftId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve( { aircraftId } )
		})
	})
}
