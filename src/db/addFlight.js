import {
	addFlightQuery,
	addFlightQueryText,
	getLastInsertIdQuery
} from './queries';

export function addFlight( aircraftId ) {
	return new Promise( function( resolve, reject ) {
		addFlightQuery( aircraftId, function ( error ) {
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
