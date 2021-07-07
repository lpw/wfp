import {
	pointsQuery,
	addPointToPointsQuery,
} from './queries';
import airports from '../points/airports.js'

let points = {}

const transform = rows => {
	return points = rows.reduce( ( pointCollection, point ) => {
		const code = point.code.toUpperCase()
		const shortCode = code[ 0 ] === 'K' ? code.substr( 1 ).toUpperCase() : code

		return {
			...pointCollection,
			[ point.id ]: {
				...points[ point.id ],
				...point
			},
			[ code ]: {
				...points[ code ],
				...point
			},
			[ shortCode ]: {
				...points[ shortCode ],
				...point
			}
		}
	}, {} )
}

export function promisePoints() {
	const pointsPromise = new Promise( function( resolve, reject ) {
		if( points && Object.keys( points ).length > 0 ) {
			console.log( `Using ${Object.keys( points ).length} points already cached`)
			resolve( points )
		} else {
			pointsQuery( function ( error, rows ) {
				if ( error ) {
					console.log( `Error querying points`)
					return reject( error ) // throw
				}

				if( rows.length > 0 ) {
					console.log( `Using ${rows.length} points already in database`)
					resolve( transform( rows ) )
				} else {
					const insertPointsPromises = Object.keys( airports ).map( k => {
						const airport = airports[ k ]
						return new Promise( function( resolve, reject ) {
							addPointToPointsQuery(
								airport.name,
								airport.icao,
								airport.aptPointType,
								airport.latitude,
								airport.longitude,
								airport.altitude,
								( error, rows ) => {
									if( error ) {
										console.log( `Error adding ${airport.icao}`)
										reject( error )
									} else {
										console.log( `Just added ${airport.icao}`)
										resolve()
									}
								}
							)
						})
					})
					const insertPointsPromise = Promise.all( insertPointsPromises )
					insertPointsPromise.then( insertedPoints => {
						console.log( `Done adding points`)
						// resolve( insertedPoints )

						pointsQuery( function ( error, rows ) {
							if ( error ) {
								console.log( `Error querying points`)
								return reject( error ) // throw
							}

							console.log( `Using ${rows.length} points added to the database`)
							resolve( transform( rows ) )
						})
					})
				}
			})
		}
	})

	return pointsPromise
}
