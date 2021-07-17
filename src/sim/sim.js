/* 
 * Simulate the real world of aircraft, flights, routs, air/vertiports, etc.
 * For convenience, for now, roll this into the process with the other services
 */
import assert from 'assert'
import fs from 'fs'
import {
	promiseFlights,
	promiseLaunch,
	// land,
} from '../db'
const debug = require('debug')('wfp:sim')

const checkInterval = 1000

const launch = flightId => {
	debug( 'LANCE sim launch flightId', flightId )
	promiseLaunch( flightId )
}

const checkLaunches = flights => {
	const now = Date.now() / 1000

    // Object.keys( flights ).map( k => flights[ k ] ).map( f => {
    flights.map( f => {
    	const notDeparted = !f.atd
    	const launchTime = now >= f.etd
		if( notDeparted && launchTime ) {
			launch( f.id )
		}
	})
}

const simCheck = () => {
	promiseFlights().then( flights => {
		checkLaunches( flights )
		setTimeout( () => {
			simCheck() 
		}, checkInterval )
	})
}

export const sim = () => {
	setTimeout( () => {
		simCheck() 
	}, checkInterval )
}

sim()
