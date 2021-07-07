import {
	addAircraftToFleetQuery,
	getLastInsertIdQuery,
	addFleetPointQuery,
} from './queries';

export function addAircraftToFleet( aircraftName, pointId ) {
	return new Promise( function( resolve, reject ) {
		addAircraftToFleetQuery( aircraftName, function ( error ) {
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
				resolve( rows[ 0 ].id )
			})
		})
	}).then( aircraftId => {
		return new Promise( function( resolve, reject ) {
			addFleetPointQuery( aircraftId, pointId, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}
				resolve( {
					aircraftId,
					aircraftName,
					pointId,
				} )
			})
		})
	})

}
