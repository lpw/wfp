/* 
 * Simulate the real world of aircraft, flights, routs, air/vertiports, etc.
 * For convenience, for now, roll this into the process with the other services
 */
import assert from 'assert'
import fs from 'fs'
import {
	promiseReadyFleet,
	promiseFlyingFleet,
	launchFlight,
	updateAircraft,
	updateFlightETA,
	// land,
} from '../db'
// import LatLon from './llmin.js' 
import LatLon from 'geodesy/latlon-spherical.js'
const debug = require('debug')('wfp:sim')
debug.enabled = !prod || true

const checkSeconds = 1
const checkTimeout = checkSeconds * 1000  
const mInNm = 1852
// const groundSpeedNMPH = 100
// const groundSpeedMPS = groundSpeedNMPH * mInNm / 60 / 60
const groundSpeedNmphToMps = mInNm / 60 / 60
// const chargeCapacity = 100000
const chargeAtOrigin = 100000
// const chargePerMeter = 1
const chargePerSecond = 100

const launch = ( aircraft, now ) => {
	debug( 'LANCE sim launch aircraft', aircraft )
	debug( 'LANCE sim launch now', now )
	const { flightId } = aircraft
	launchFlight( flightId, now )
}

const fly = ( aircraft, now ) => {
	debug( 'LANCE sim fly aircraft', aircraft )
	debug( 'LANCE sim fly now', now )

	const { lat, lon, originLat, originLon, destinationLat, destinationLon } = aircraft

	let { charge = chargeAtOrigin } = aircraft

	const { heading = 360, aircraftSpeed: speed = 100, aircraftAltitude: altitude = 10000, pitch = 1, yaw = 2, roll = 3, turn = 4, vsi = 5 } = aircraft

	const { atd } = aircraft
	assert( atd )

	assert( originLat )
	assert( originLon )
	const origin = new LatLon( originLat, originLon )

	assert( destinationLat )
	assert( destinationLon )
	const destination = new LatLon( destinationLat, destinationLon )

	let current
	if( lat && lon ) {
		current = new LatLon( lat, lon )
	} else {
		current = origin
	}

 debug( 'sim fly origin', origin )
 debug( 'sim fly destination', destination )
 debug( 'sim fly current', current )

	const totalDistance = origin.distanceTo( destination )
	const coveredDistance = origin.distanceTo( current )
	const remainingDistance = current.distanceTo( destination )
 debug( 'sim fly totalDistance', totalDistance )
 debug( 'sim fly coveredDistance', coveredDistance )
 debug( 'sim fly remainingDistance', remainingDistance )
	assert( Math.round( coveredDistance + remainingDistance ) === Math.round( totalDistance ) )

	const mps = speed * groundSpeedNmphToMps
	const ete = totalDistance / mps
	const etr = remainingDistance / mps
	// const eta = atd + ete
	const eta = now + etr
 debug( 'sim fly speed', speed )
 debug( 'sim fly ete', ete )
 debug( 'sim fly eta', eta )
 debug( 'sim fly atd', atd )
	// debug( 'sim fly eta', ata )
	
	// const fraction = coveredDistance / totalDistance
	const elapsed = now - atd

	const fraction = elapsed / ete
	const ip = origin.intermediatePointTo( destination, fraction )
 debug( 'sim fly elapsed', elapsed )
 debug( 'sim fly fraction', fraction )
 debug( 'sim fly ip', ip )
	assert( fraction >= 0 && fraction <= 1 )

	// charge = chargeAttotalDistanceOrigin - chargePerMeter * coveredDistance
	// charge -= chargePerMeter * distance
	// charge = chargeAtOrigin - chargePerSecond * elapsed
	charge -= chargePerSecond * checkSeconds
 debug( 'sim fly charge', charge )

	updateAircraft( aircraft.id, charge, ip.lat, ip.lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi )
	updateFlightETA( aircraft.flightId, eta )
}

const launchFleet = fleet => {
	const now = Date.now() / 1000
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

const flyFleet = fleet => {
	const now = Date.now() / 1000
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
	const readyFleetPromise = promiseReadyFleet().then( fleet => {
		launchFleet( fleet )
	})
	const flyingFleetPromise = promiseFlyingFleet().then( fleet => {
		flyFleet( fleet )
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