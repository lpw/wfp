import {
	addAircraftQuery,
} from './queries';

export function addAircraft( aircraftName, pointId ) {
	return new Promise( function( resolve, reject ) {
		addAircraftQuery( aircraftName, pointId, function ( error ) {
			if ( error ) {
				return reject( error ) // throw
			}
			resolve()
		})
	})
}
