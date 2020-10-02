import fetch from 'isomorphic-fetch'
import {
	pointTypesQuery,
} from '../db/queries'

let aptPointType
let navPointType
const pointTypesPromise = new Promise( function( resolve, reject ) {
	pointTypesQuery( function ( error, rows ) {
		if ( error ) {
			return reject( error ) // throw
		}

		resolve( rows )
	})
})
pointTypesPromise.then( pointTypes => {
	const aptPointTypeRow = pointTypes.find( s => s.name === 'apt' )
	const navPointTypeRow = pointTypes.find( s => s.name === 'nav' )
	aptPointType = aptPointTypeRow ? aptPointTypeRow.id : 1
	navPointType = navPointTypeRow ? navPointTypeRow.id : 3
})

const unknownPoint = pt => Promise.resolve({
	name: pt,
	type: aptPointType,
	lat: 123,
	lon: 456,
	elevation: 789
})

const unknownPointPromise = pt => Promise.resolve( unknownPoint )

function fetchAirportFromDescription( pt ) {
	const url = `https://raw.githubusercontent.com/epranka/airports-db/master/icao/${pt}.json`
	return fetch( url, {
		// method: 'GET'
		// headers,
	})
	.then( response => {
		if( response.status === 200 ) {
			return response.json()
		} else {
			// throw new Error( `fetchPointFromDescription not 200 ${response.status}` )
			console.warn( `fetchPointFromDescription not 200 ${response.status}` )
			return unknownPointPromise
		}
	})
	.then( data => {
		// const { ident, type, name } = data
		const { elevation_ft: elevation, latitude_deg: lat, longitude_deg: lon } = data
		const point = {
			name: pt,
			type: aptPointType,
			lat,
			lon,
			elevation,
		}
		return point
	})
}

function getPointFromDescription( pt ) {
	if( pt.startsWith( 'APT' ) ) {
		const ptSplit = pt.split( '@' )
		const apt = ptSplit.length > 1 && ptSplit[ 1 ]
		return apt ? fetchAirportFromDescription( apt ) : unknownPointPromise( pt )
	} else if( pt.startsWith( 'NAV' ) ) {
		// todo: navaids
		return unknownPointPromise( pt )
	} else if( pt.startsWith( 'AWY' ) ) {
		// todo: airways
		return unknownPointPromise( pt )
	} else if( pt.startsWith( 'TAILNUM' ) ) {
		// todo: tail numbers
		return unknownPointPromise( pt )
	} else if( pt.startsWith( '+' ) || pt.startsWith( '-' ) ) {
		const ptSplit = pt.split( '/' )
		if( ptSplit.length > 1 ) {
			lat = +ptSplit[ 0 ]
			lon = +ptSplit[ 1 ]
			return Promise.resolve({
				name: pt,
				type: navPointType,
				lat,
				lon,
				elevation: 789
			})
		} else {
			return unknownPointPromise( pt )
		}
	} else if( pt.endsWith( 'FT' ) ) {
		// const ptSplit = pt.split( 'FT' )
		// const ft = ptSplit.length > 1 && ptSplit[ 0 ]
		// todo: altitude
		return unknownPointPromise( pt )
	} else if( pt.endsWith( 'KTS' ) ) {
		// const ptSplit = pt.split( 'KTS' )
		// const kts = ptSplit.length > 1 && ptSplit[ 0 ]
		// todo: speed
		return unknownPointPromise( pt )
	}

	return unknownPointPromise( pt )
}

export function getPointsFromDescription( description ) {
	description = description.replace( /^.*q=/, '' ).toUpperCase()
	const points = description.split( '+' )
	const pointsWithTypes = points.reduce( ( s, p ) => ( { ...s, [ p ]: getPointFromDescription( p ) } ), {} )
	return pointsWithTypes
}
	
