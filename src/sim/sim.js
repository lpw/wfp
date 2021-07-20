/* 
 * Simulate the real world of aircraft, flights, routs, air/vertiports, etc.
 * For convenience, for now, roll this into the process with the other services
 */
import assert from 'assert'
import fs from 'fs'
import {
	promiseLaunchingFleet,
	promiseFlyingFleet,
	launchFlight,
	landFlight,
	updateAircraft,
	updateFlightETA,
	// land,
} from '../db'
// import LatLon from './llmin.js' 
// import LatLon from 'geodesy/latlon-spherical.js'
// import turf from 'turf'
// import * as turf from '@turf/turf';
// import * from '@turf/distance'
// import * from '@turf/along'
// import {along} from '@turf/along'
// import {point} from '@turf/helpers'
// import {distance} from '@turf/distance'
import * as turf from '@turf/turf'
const debug = require('debug')('wfp:sim')
const prod = process.env.NODE_ENV === 'production' 
debug.enabled = !prod || true

const checkSeconds = 10
const checkTimeout = checkSeconds * 1000  
// const mInNm = 1852
// const groundSpeedNMPH = 100
// const groundSpeedMPS = groundSpeedNMPH * mInNm / 60 / 60
// const groundSpeedNmphToMps = mInNm / 60 / 60
const groundSpeedNmphToNmps = 1 / 60 / 60
// const chargeCapacity = 100000
const rechargedCapacity = 100000
// const chargePerMeter = 1
const chargeLossPerSecond = 10
const turfOptions = { units: 'nauticalmiles' }

const launch = ( aircraft, now ) => {
	debug( 'launch aircraft', aircraft )
	debug( 'launch now', now )

	const {
		id,
		flightId,

		originLat, 
		originLon, 

		// charge = rechargedCapacity,

		heading = 360,
		aircraftSpeed: speed = 100,
		aircraftAltitude: altitude = 10000,
		pitch = 1,
		yaw = 2,
		roll = 3,
		turn = 4,
		vsi = 5,
	} = aircraft

	const charge = rechargedCapacity
	
	updateAircraft( id, charge, originLat, originLon, heading, speed, altitude, pitch, yaw, roll, turn, vsi )
	launchFlight( flightId, now )
}

const land = ( aircraft, now ) => {
	debug( 'land aircraft', aircraft )
	debug( 'land now', now )

	const {
		id,
		flightId,

		destinationLat, 
		destinationLon, 

		charge = rechargedCapacity,

		heading = 360,
		// aircraftSpeed: speed = 100,
		aircraftAltitude: altitude = 10000,
		pitch = 1,
		yaw = 2,
		roll = 3,
		turn = 4,
		vsi = 5,
	} = aircraft

	const speed = 0

	updateAircraft( id, charge, destinationLat, destinationLon, heading, speed, altitude, pitch, yaw, roll, turn, vsi )
	landFlight( flightId, now )
}

const fly = ( aircraft, now ) => {
	debug( 'fly aircraft', aircraft )
	debug( 'fly now', now )

	const { lat, lon, originLat, originLon, destinationLat, destinationLon } = aircraft

	let { charge = rechargedCapacity } = aircraft

	const { heading = 360, aircraftSpeed: speed = 100, aircraftAltitude: altitude = 10000, pitch = 1, yaw = 2, roll = 3, turn = 4, vsi = 5 } = aircraft

	const { atd } = aircraft
	assert( atd )

	assert( originLat )
	assert( originLon )
	// const origin = new LatLon( originLat, originLon )
	const originCoords = [ originLon, originLat ]
	const origin = new turf.point( originCoords )
	// const origin = new point( originLon, originLat )

	assert( destinationLat )
	assert( destinationLon )
	// const destination = new LatLon( destinationLat, destinationLon )
	const destinationCoords = [ destinationLon, destinationLat ]
	const destination = new turf.point( destinationCoords )
	// const destination = new point( destinationLon, destinationLat )

	let current
	if( lat && lon ) {
		// current = new LatLon( lat, lon )
		const currentCoords = [ lon, lat ]
		current = new turf.point( currentCoords )
		// current = new point( lon, lat )
	} else {
		current = origin
	}

 debug( 'fly origin', origin )
 debug( 'fly destination', destination )
 debug( 'fly current', current )

	// const totalDistance = origin.distanceTo( destination )
	// const coveredDistance = origin.distanceTo( current )
	// const remainingDistance = current.distanceTo( destination )
	const totalDistance = turf.distance( origin, destination, turfOptions )
	const coveredDistance = turf.distance( origin, current, turfOptions )
	const remainingDistance = turf.distance( current, destination, turfOptions )
	// const totalDistance = distance( origin, destination )
	// const coveredDistance = distance( origin, current )
	// const remainingDistance = distance( current, destination )

 debug( 'fly totalDistance', totalDistance )
 debug( 'fly coveredDistance', coveredDistance )
 debug( 'fly remainingDistance', remainingDistance )
	// assert( Math.round( coveredDistance + remainingDistance ) === Math.round( totalDistance ) )
	// if( !( Math.round( coveredDistance + remainingDistance ) === Math.round( totalDistance ) ) ) {
	// 	console.warn( 'Overflown flight distance', aircraft.flightId, coveredDistance, remainingDistance, totalDistance )
	// }

	const nmps = speed * groundSpeedNmphToNmps
	const ete = totalDistance / nmps
	const etr = remainingDistance / nmps
	// const eta = atd + ete
	const eta = now + etr
 debug( 'fly speed', speed )
 // debug( 'fly ete', ete )
 debug( 'fly eta', eta )
 debug( 'fly atd', atd )
	// debug( 'fly eta', ata )
	
	// const fraction = coveredDistance / totalDistance
	const elapsed = now - atd

	const fraction = elapsed / ete
	// const ip = origin.intermediatePointTo( destination, fraction )
	const alongLine = turf.lineString( [ originCoords, destinationCoords ] )
	// const ip = turf.along( alongLine, coveredDistance, turfOptions )
	// const ip = along( origin, destination, fraction * totalDistance )
	const ip = turf.along( alongLine, fraction * totalDistance )
 debug( 'fly elapsed', elapsed )
 // debug( 'fly fraction', fraction )
 debug( 'fly ip', ip )
	// assert( fraction >= 0 && fraction <= 1 )
	// if( !( fraction >= 0 && fraction <= 1 ) ) {
	// 	console.warn( 'Overflown flight fraction', aircraft.flightId, fraction )
	// }
	// assert( fraction >= 0 )

	// if( remainingDistance <= 0 || fraction >= 1 ) {
	if( remainingDistance <= 0 || coveredDistance >= totalDistance ) {
	// if( remainingDistance <= 0 ) {
		land( aircraft, now )
	}

	// charge = chargeAttotalDistanceOrigin - chargePerMeter * coveredDistance
	// charge -= chargePerMeter * distance
	// charge = rechargedCapacity - chargeLossPerSecond * elapsed
	charge -= chargeLossPerSecond * checkSeconds
 debug( 'fly charge', charge )

 	// const { geometry: { coordinates: [ ipLon, ipLat ] } } = ip
 	const { geometry } = ip
 	const { coordinates } = geometry
 	const [ ipLon, ipLat ] = coordinates
	updateAircraft( aircraft.id, charge, ipLat, ipLon, heading, speed, altitude, pitch, yaw, roll, turn, vsi )
	updateFlightETA( aircraft.flightId, eta )
}

const launchFleet = ( fleet, now ) => {
    Object.keys( fleet ).map( k => fleet[ k ] ).map( a => {
    	const departed = !!a.atd
    	const landed = !!a.ata
    	const ready = !!a.ata
    	const launchTime = now >= a.etd
    	assert( !departed )
    	assert( !landed )
    	assert( launchTime )
		launch( fleet[ a.id ], now )
	})
}

const flyFleet = ( fleet, now ) => {
    Object.keys( fleet ).map( k => fleet[ k ] ).map( a => {
    	const departed = !!a.atd
    	const landed = !!a.ata
    	assert( departed )
    	assert( !landed )
		fly( fleet[ a.id ], now )
	})
}

// const simCheckFlights = () => {
// 	promiseFlights().then( flights => {
// 		checkFlights( flights )
// 		setTimeout( () => {
// 			simCheck() 
// 		}, checkTimeout )
// 	})
// }

const simCheck = () => {
	const now = Date.now() / 1000  // presume time sync w database server
	const readyFleetPromise = promiseLaunchingFleet().then( fleet => {
		launchFleet( fleet, now )
	})
	const flyingFleetPromise = promiseFlyingFleet().then( fleet => {
		flyFleet( fleet, now )
	})
	Promise.all( [ readyFleetPromise, flyingFleetPromise ] ).then( () => {
		setTimeout( () => {
			simCheck() 
		}, checkTimeout )
	})
}

export const sim = () => {
	setTimeout( () => {
		simCheck() 
	}, checkTimeout )
}

sim()

// sanity checks

// const psfo = new LatLon( 37.61899948120117, -122.375 )
// const prno = new LatLon( 39.49909973144531, -119.76799774169922 )

// const r = psfo.distanceTo( prno )
// const i = psfo.intermediatePointTo( prno, 0.5 )

// debug( 'psfo', psfo )
// debug( 'prno', prno )
// debug( 'r', r )
// debug( 'i', i )