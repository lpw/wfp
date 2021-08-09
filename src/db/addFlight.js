import {
	addFlightQuery,
	getLastInsertIdQuery,
} from './queries';
const debug = require('debug')('wfp:sim')

export function addFlight( aircraftId, routeId ) {
	const flightPromise = new Promise( function( resolve, reject ) {
		return addFlightQuery( aircraftId, routeId, function ( error ) {
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
	})

	return flightPromise.then( flightId => {
		debug( 'flightId', flightId )
		return flightId
	})
}
