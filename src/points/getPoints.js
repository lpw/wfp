import fetch from 'isomorphic-fetch'
import {
	pointTypesQuery,
} from '../db/queries'

// const airports = require('airport-data')
// const airports = require('./airports.js')
import airports from './airports.js'
// let airports
// function fetchAirports() {
// 	fetchAirportData()
// 		.then( a => {
// 			airports = a
// 		})
// }

const debug = require('debug')('wfp:points')

let aptPointType
let navPointType
let unkPointType
const pointTypesPromise = new Promise( function( resolve, reject ) {
	pointTypesQuery( function ( error, rows ) {
		if ( error ) {
			return reject( error ) // throw
		}

		resolve( rows )
	})
})
pointTypesPromise.then( pointTypes => {
    debug( 'pointTypes', pointTypes )
	const aptPointTypeRow = pointTypes.find( s => s.name === 'apt' )
	const navPointTypeRow = pointTypes.find( s => s.name === 'nav' )
	const unkPointTypeRow = pointTypes.find( s => s.name === 'unk' )
	aptPointType = aptPointTypeRow ? aptPointTypeRow.id : 1
	navPointType = navPointTypeRow ? navPointTypeRow.id : 2
	unkPointType = unkPointTypeRow ? unkPointTypeRow.id : 3
})

// const unknownPointPromise = pt => Promise.resolve( {
// 	name: pt,
// 	type: unkPointType,
// 	lat: 123,
// 	lon: 456,
// 	elevation: 789
// } )
const unknownPointPromise = Promise.resolve( {
	name: 'unknown',
	type: unkPointType,
	lat: 123,
	lon: 456,
	elevation: 789
} )
const unknownPoint = pt => unknownPointPromise

function findAirport( code ) {
	if( !airports || !airports[ code ] ) {  // !airports.KEYS.length > 0 || 
		// todo: avoid overlapping requestd and too many retries
		// fetchAirports()
	} else {
		const airport = airports[ code ]
		const point = {
			name: airport.name,
			type: aptPointType,
			lat: airport.latitude,
			lon: airport.longitude,
			elevation: airport.altitude,
		}
		return Promise.resolve( point )
	}
}


function fetchAirportFromDescription( pt ) {
	// const url = `https://raw.githubusercontent.com/epranka/airports-db/master/icao/${pt}.json`

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
			return unknownPoint
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
	if( pt.startsWith( 'APT@' ) ) {
		const ptSplit = pt.split( '@' )
		const apt = ptSplit.length > 1 && ptSplit[ 1 ]
		// return apt ? fetchAirportFromDescription( apt ) : unknownPoint( pt )
		return apt ? findAirport( apt ) : unknownPoint( pt )
	} else if( pt.startsWith( 'NAV@' ) ) {
		// todo: navaids
		return unknownPoint( pt )
	} else if( pt.startsWith( 'AWY@' ) ) {
		// todo: airways
		return unknownPoint( pt )
	} else if( pt.startsWith( 'TAILNUM@' ) ) {
		// todo: tail numbers
		return unknownPoint( pt )
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
			return unknownPoint( pt )
		}
	} else if( pt.match( /[0-9]*ft/i ) ) {
		// const ptSplit = pt.split( 'FT' )
		// const ft = ptSplit.length > 1 && ptSplit[ 0 ]
		// todo: altitude
		return unknownPoint( pt )
	} else if( pt.match( /[0-9]*kts/i ) ) {
		// const ptSplit = pt.split( 'KTS' )
		// const kts = ptSplit.length > 1 && ptSplit[ 0 ]
		// todo: speed
		return unknownPoint( pt )
	} else {
		return findAirport( pt )
	}

	return unknownPoint( pt )
}

export function getPointsFromDescription( description ) {
	description = description.replace( /^.*q=/, '' ).toUpperCase()
	const points = description.split( /[+ ]/ )
	const pointsWithTypes = points.reduce( ( s, p ) => {
		const point = getPointFromDescription( p )
		// return point.type === unkPointType ? s : { ...s, [ p ]: point }
		return point === unknownPointPromise ? s : { ...s, [ p ]: point }
	}, {} )
    debug( 'pointsWithTypes', pointsWithTypes )
	return pointsWithTypes
}
	
