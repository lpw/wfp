/* 
 * For convenience, roll both the FE and API services into one module here,
 * can easily run them as one process that handles both FE and API,
 * or can run them as two separate process later (or serverless)
 */
import assert from 'assert'
import fs from 'fs'
import Hapi from 'hapi'
import Inert from 'inert'

// import { sim } from '../sim'

import handleRender from './handleRender'

import {
	addFlight,
	addAircraft,
	deleteFlight,
	deleteAircraft,
	addRoute,
	promiseFlights,
	promiseFlight,
	promiseTypes,
	promiseUsers,
	promiseFleet,
	promiseFlyingFleet,
	promiseLaunchingFleet,
	promisePoints,
	addFlightRoute,
	landFlight,
	promiseRoutes,
	updateAircraft,
	launchFlight,
	updateLandingAircraft,
	updateRouteDistance,
	updateRouteBearing,
} from '../db'

const debug = require('debug')('wisk:server')

const host = process.env.API_HOST || 'localhost'
const port = process.env.API_PORT || '3000'

/// enabled normally in production
const noRedirect = true
const noSSL = true
const noSSR = true

const oneDayInMsec = 24 * 60 * 60 * 1000

// const tls = noSSL ? {} : {
// 	key: fs.readFileSync('/etc/letsencrypt/live/w.com/privkey.pem'),
// 	cert: fs.readFileSync('/etc/letsencrypt/live/w.com/fullchain.pem')
// };

function connectHttp() {
	return new Hapi.Server({
		host,
		port,
		routes: {
			cors: true
		},
		// cors: { 
		// 	origin: ["*"],
		// 	headers: ["Access-Control-Allow-Headers", "Access-Control-Allow-Origin","Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"],
		// 	additionalHeaders: ["Access-Control-Allow-Headers: Origin, Content-Type, x-ms-request-id , Authorization"],
		// 	// credentials: true
		// },
		// state: {
		// 	isSameSite: false,
		// 	isHttpOnly: false,
		// 	ttl: 365 * oneDayInMsec,
		// 	isSecure: false,
		// 	// encoding: 'base64json',
		// 	clearInvalid: true, // remove invalid cookies
		// 	ignoreErrors: true,
		// 	strictHeader: false // do allow violations of RFC 6265
		// }
	})
}

// function connectHttps() {
// 	return new Hapi.Server({
// 		tls,
// 		host,
// 		port: 443,
// 		routes: {
// 			cors: true
// 		},
// 		// security: true,
// 		state: {
// 			isSameSite: false,
// 			isHttpOnly: false,
// 			ttl: 365 * oneDayInMsec,
// 			isSecure: false,
// 			// encoding: 'base64json',
// 			clearInvalid: true, // remove invalid cookies
// 			ignoreErrors: true,
// 			strictHeader: false // do allow violations of RFC 6265
// 		}
// 	})
// }

// redirect http to https
function routeRedirect( server ) {
	function redirect( request, reply ) {
		return reply.redirect( `https://${request.info.host}${request.path}`)
	}
	server.route( { method: 'GET', path: '/', handler: redirect, options: { cors: true } } )
	server.route( { method: 'GET', path: '/index.html', handler: redirect, options: { cors: true } } )
}

// for SSR, server-side rendering of prerendered and loaded index.html
function routeRootSSR( path, server ) {
	server.route({
		method: 'GET',
		path,
		// handler: handleRender
		handler: ( request, reply ) => { 
			// let { query, headers = {} } = request

			return handleRender({
				request,
				reply, 
			})
		},
		options: {
			cors: true
		}
	});
}

// client-side rendering via index.html
function routeRootCSR( path, server ) {
	server.route({
		method: 'GET',
		path,
		handler: {
			file: './build/index.html'
		},
		options: {
			cors: true
		}
	});
}

// route index.html explicitly
function routeIndexHtml( server ) {
	if( !noSSR ) {
		routeRootSSR( '/index.html', server )
	} else {
		routeRootCSR( '/index.html', server )
	}
}

// route anything outside of index.html and static assets and API to index.html
function routeRootAny( server ) {
	if( !noSSR ) {
		routeRootSSR( '/{p*}', server )
	} else {
		routeRootCSR( '/{p*}', server )
	}
}

// all static assets built, deployed, and referenced under /static so route them there
function routeStaticAssets( server ) {
	server.route({
		method: 'GET',
		path: '/static/{param*}',
		handler: {
			directory: {
				path: './build/static'
			}
		},
		options: {
			cors: true,
			cache: {
				expiresIn: oneDayInMsec,
				privacy: 'private'
			}
		}
	});
}

// versioned api
const version = 'apiv1'

function routeApi( server ) {
	server.route({
		method: ['GET', 'POST', 'PUT'], 
		path: `/${version}/{op}`,
		options: {
			cors: true
		},
		handler: function( request, reply ) {
			const { params: { op }, method } = request  // query also available
			let { payload = {} } = request
			payload = payload || {}	// because hapi sets payload to null instead of undefined

			switch( method.toLowerCase() ) {
				case 'post':
				case 'put': {
					switch( op.toLowerCase() ) {
						case 'flights': {
							debug( 'routeApi', method, op, typeof payload, payload )
							const { aircraftId, routeId } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							return addFlight( aircraftId, routeId ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
									// header, 
									// request: payload
								}

								// return reply.response( replyResult )
								debug( 'routeApi addFlight then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
						}
						case 'fleet': {
							debug( 'routeApi', method, op, typeof payload, payload )
							const { name, pointId } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							return addAircraft( name, pointId ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeApi addAircraft then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
						}
						default: {
							debug( 'routeApi unknown op for method', op, method, payload )
							return {
								error: `op /${op} unknown op`
							}
							break
						}
					}
				}
				case 'get': {
					switch( op.toLowerCase() ) {
						case 'flights': {
							debug( 'routeApi', op )
							return promiseFlights().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
									// header, 
									// request: payload
								}

								// return reply.response( replyResult )
								debug( 'routeApi promiseFlights then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
						}
						case 'users': {
							debug( 'routeApi', op )
							return promiseUsers().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
							break
						}
						case 'fleet': {
							debug( 'routeApi', op )
							return promiseFleet().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
							break
						}
						case 'launchingfleet': {
							debug( 'routeApi', op )
							return promiseLaunchingFleet().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
							break
						}
						case 'flyingfleet': {
							debug( 'routeApi', op )
							return promiseFlyingFleet().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
							break
						}
						case 'points': {
							debug( 'routeApi', op )
							return promisePoints().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
							break
						}
						case 'routes': {
							debug( 'routeApi', op )
							return promiseRoutes().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
							break
						}
						case 'types': {
							debug( 'routeApi', op )
							return promiseTypes().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
							break
						}
						default: {
							debug( 'routeApi unknown op', op, payload )
							return {
								error: `op /${op} unknown op`
							}
							break
						}
					}
				}
				default: {
					debug( 'routeApi unknown method', method )
					return {
						error: `method /${method} unknown method`
					}
					break
				}
			}
		}
	})
}

function routeArgApi( server ) {
	server.route({
		method: ['GET', 'POST', 'PUT', 'DELETE'], 
		path: `/${version}/{op}/{id}`,
		options: {
			cors: true
		},
		handler: function( request, reply ) {
			const { params: { op, id: idString }, method, payload } = request  // query also available
			const id = +idString
			switch( method.toLowerCase() ) {
				case 'put':
				case 'post': {
					switch( op.toLowerCase() ) {
						case 'flightroute': {
							debug( 'routeApi', method, op, typeof payload, payload )
							const { aircraft, origin, destination, altitude, speed } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							assert( +aircraft === +id )  // until we decide
							return addFlightRoute( +id, origin, destination, altitude, speed ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeApi addFlightRoute then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								console.warn( 'routeApi error', error.message ) 
								return {
									error: `op /${op} error ${error.message}`
								}
							})
						}
						case 'fleet': {
							const { action, lat, lon, altitude, speed, heading, pitch, yaw, roll, turn, vsi, charge } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							switch( action.toLowerCase() ) {
								case 'land': {
									debug( 'routeApi', method, op, typeof payload, payload )
									const { id, lat, lon, altitude } = typeof payload === 'string' ? JSON.parse( payload ) : payload
									return updateLandingAircraft( id, lat, lon, altitude ).then( result => {
										const replyResult = {
											status: 'ok', 
											result, 
										}
										debug( 'routeApi updateLandingAircraft then replyResult', replyResult )
										return replyResult
									}).catch( error => {
										console.warn( 'routeApi error', error.message ) 
										return {
											error: `op /${op} error ${error.message}`
										}
									})
								}
								default: {
									debug( 'routeApi', method, op, typeof payload, payload )
									const { id: aircraftId, charge, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi } = typeof payload === 'string' ? JSON.parse( payload ) : payload
									assert( +aircraftId === +id )  // until we decide
									return updateAircraft( id, charge, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi ).then( result => {
										const replyResult = {
											status: 'ok', 
											result, 
										}
										debug( 'routeApi updateAircraft then replyResult', replyResult )
										return replyResult
									}).catch( error => {
										console.warn( 'routeApi error', error.message ) 
										return {
											error: `op /${op} error ${error.message}`
										}
									})
								}
							}
						}
						case 'flight': {
							const { action, atd, ata } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							switch( action.toLowerCase() ) {
								case 'launch': {
									debug( 'routeArgApi post flight action', id, atd, action )
									return launchFlight( id, atd ).then( result => {
										const replyResult = {
											status: 'ok', 
											result, 
										}
										debug( 'routeArgApi post flight then replyResult', replyResult )
										return replyResult
									}).catch( error => {
										debug( 'routeArgApi post flight error', error.message )
										console.warn( 'routeArgApi post flight error', error.message ) 
										return {
											error: `routeArgApi post flight/${id} error ${error.message}`
										}
									})
								}
								case 'land': {
									debug( 'routeArgApi post flight action', id, ata, action )
									return landFlight( id, ata ).then( result => {
										const replyResult = {
											status: 'ok', 
											result, 
										}
										debug( 'routeArgApi post flight then replyResult', replyResult )
										return replyResult
									}).catch( error => {
										debug( 'routeArgApi post flight error', error.message )
										console.warn( 'routeArgApi post flight error', error.message ) 
										return {
											error: `routeArgApi post flight/${id} error ${error.message}`
										}
									})
								}
								default: {
									const { path, altitude, speed } = typeof payload === 'string' ? JSON.parse( payload ) : payload
									debug( 'routeArgApi post flight action, path, altitude, speed', id, action, path, altitude, speed )
									return addRoute( id, path, altitude, speed ).then( result => {
										const replyResult = {
											status: 'ok', 
											result, 
										}
										debug( 'routeArgApi post flight then replyResult', replyResult )
										return replyResult
									}).catch( error => {
										debug( 'routeArgApi post flight error', error.message )
										console.warn( 'routeArgApi post flight error', error.message ) 
										return {
											error: `routeArgApi post flight/${id} error ${error.message}`
										}
									})
								}
							}
						}
						case 'route': {
							const { action, distance, bearing } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							switch( action.toLowerCase() ) {
								case 'distance': {
									debug( 'routeArgApi post route action', id, action )
									return updateRouteDistance( id, distance ).then( result => {
										const replyResult = {
											status: 'ok', 
											result, 
										}
										debug( 'routeArgApi post route then replyResult', replyResult )
										return replyResult
									}).catch( error => {
										debug( 'routeArgApi post route error', error.message )
										console.warn( 'routeArgApi post route error', error.message ) 
										return {
											error: `routeArgApi post route/${id} error ${error.message}`
										}
									})
								}
								case 'bearing': {
									debug( 'routeArgApi post route action', id, action )
									return updateRouteBearing( id, bearing ).then( result => {
										const replyResult = {
											status: 'ok', 
											result, 
										}
										debug( 'routeArgApi post route then replyResult', replyResult )
										return replyResult
									}).catch( error => {
										debug( 'routeArgApi post route error', error.message )
										console.warn( 'routeArgApi post route error', error.message ) 
										return {
											error: `routeArgApi post route/${id} error ${error.message}`
										}
									})
								}
								default: {
									debug( 'routeArgApi post route error', 'unknown action' )
									console.warn( 'routeArgApi post route error', 'unknown action' ) 
									return {
										error: `routeArgApi post route/${id} error ${'unknown action'}`
									}
								}
							}
						}
					}
				}
				case 'delete': {
					switch( op.toLowerCase() ) {
						case 'flight': {
							debug( 'routeArgApi post flight', id )
							return deleteFlight( id ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeArgApi delete flight then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								debug( 'routeArgApi delete flight error', error.message )
								console.warn( 'routeArgApi delete flight error', error.message ) 
								return {
									error: `routeArgApi delete flight/${id} error ${error.message}`
								}
							})
						}
						case 'fleet': {
							debug( 'routeArgApi post flight', id )
							return deleteAircraft( id ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeArgApi deleteAircraft then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								debug( 'routeArgApi deleteAircraft error', error.message )
								console.warn( 'routeArgApi deleteAircraft error', error.message ) 
								return {
									error: `routeArgApi deleteAircraft/${id} error ${error.message}`
								}
							})
						}
					}
				}
				case 'get': {
					switch( op.toLowerCase() ) {
						case 'flight': {
							return promiseFlight( id ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeArgApi flight promiseFlight get then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								console.warn( 'routeArgApi promiseFlight get error', error.message ) 
								return {
									error: `routeArgApi promiseFlight/${id} get error ${error.message}`
								}
							})
						}
						// case 'route': {
						// 	return promiseRoute( id ).then( result => {
						// 		const replyResult = {
						// 			status: 'ok', 
						// 			result, 
						// 		}
						// 		debug( 'routeArgApi route promiseRoute get then replyResult', replyResult )
						// 		return replyResult
						// 	}).catch( error => {
						// 		console.warn( 'routeArgApi promiseRoute get error', error.message ) 
						// 		return {
						// 			error: `routeArgApi promiseRoute/${id} get error ${error.message}`
						// 		}
						// 	})
						// }
						default: {
							console.warn( 'routeArgApi unknown op', op )
							debug( 'routeArgApi unknown op', op )
							return {
								error: `method ${method} unknown op ${op}`
							}
						}
					}
				}
				default: {
					console.warn( 'routeArgApi unknown method', method )
					debug( 'routeArgApi unknown method', method )
					return {
						error: `method /${method} unknown method`
					}
					break
				}
			}
		}
	})
}

function startServer( server ) {
	server.start().then( () => {
		console.log( `Server running at: ${JSON.stringify( server.info, null, 4 )}` )
	})
}

// if( !noSSL ) {
// 	const httpsServer = connectHttps()

// 	httpsServer.register( Inert ).then( () => {
// 		routeStaticAssets( httpsServer )
// 		routeRootAny( httpsServer )
// 		routeIndexHtml( httpsServer )
// 		routeApi( httpsServer )
// 		routeArgApi( httpsServer )
// 		startServer( httpsServer )
// 	} )
// }

const httpServer = connectHttp()

httpServer.register( Inert ).then( () => {
	routeStaticAssets( httpServer )
	if( !noRedirect ) {
		routeRedirect( httpServer )
	} else {
		routeRootAny( httpServer )
		routeIndexHtml( httpServer )
		routeApi( httpServer )
		routeArgApi( httpServer )
	}
	startServer( httpServer )
} )

process.on('unhandledRejection', (err) => {
    console.warn(err);
    process.exit(1);
});

