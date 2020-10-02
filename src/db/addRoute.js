import {
	addRouteToRoutesQuery,
	addRouteToFlightPlansQuery,
	addPointToPointsQuery,
	addPointToRouteQuery,
	getLastInsertIdQuery,
	pointTypesQuery,
} from './queries'
import {
	getPointsFromDescription
} from '../points'

export function addRoute( flightPlanId, description, altitude ) {
	const getPointsPromise = Promise.all( Object.values( getPointsFromDescription( description ) ) )

	const addRoutePromise = new Promise( function( resolve, reject ) {
		addRouteToRoutesQuery( description, altitude, function ( error ) {
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
	}).then( routeId => {
		return new Promise( function( resolve, reject ) {
			addRouteToFlightPlansQuery( flightPlanId, routeId, function ( error ) {
				if ( error ) {
					return reject( error ) // throw
				}

				resolve( routeId )
			})
		})
	})

	const queryPromise = Promise.all( [ getPointsPromise, addRoutePromise ] )

	return queryPromise.then( ( [ pointsWithTypes, routeId ] ) => {
		const addPointToPointsPromises = Object.values( pointsWithTypes ).map( pointWithType => {
			const { name, type, lat, lon, elevation } = pointWithType
			return new Promise( function( resolve, reject ) {
				addPointToPointsQuery( name, type, lat, lon, elevation, function ( error, compoundRows ) {
					if ( error ) {
						return reject( error ) // throw
					}
					resolve({
						...pointWithType,
						id: compoundRows[ 1 ][ 0 ].id
					})
				})
			})
		})
		return Promise.all( addPointToPointsPromises ).then( pointsWithTypesAndId => {
			const addPointToRoutePromises = Object.values( pointsWithTypesAndId ).map( ( { id: pointId } ) => {
				return new Promise( function( resolve, reject ) {
					addPointToRouteQuery( routeId, pointId, function ( error ) {
						if ( error ) {
							return reject( error ) // throw
						}
						resolve()
					})
				})
			return Promise.all( addPointToRoutePromises )
			})
		})
	})
}
