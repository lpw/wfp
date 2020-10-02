/* 
 * For convenience, roll both the FE and API services into one module here,
 * can easily run them as one process that handles both FE and API,
 * or can run them as two separate process later (or serverless)
 */

import fs from 'fs';
import Hapi from 'hapi';
import Inert from 'inert';

import handleRender from './handleRender';

import {
	addFlightPlan,
	addRoute,
	promiseFlightPlans,
	promiseFlightPlan,
	promiseTypes,
	promiseUsers,
} from '../db'

const debug = require('debug')('wisk:server')

const host = process.env.API_HOST || 'localhost'
const port = process.env.API_PORT || '3000'

/// enabled normally in production
const noRedirect = true
const noSSL = true
const noSSR = true

const oneDayInMsec = 24 * 60 * 60 * 1000

const tls = noSSL ? {} : {
	key: fs.readFileSync('/etc/letsencrypt/live/w.com/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/w.com/fullchain.pem')
};

function connectHttp() {
	return new Hapi.Server({
		host,
		port,
		routes: {
			cors: true
		},
		state: {
			isSameSite: false,
			isHttpOnly: false,
			ttl: 365 * oneDayInMsec,
			isSecure: false,
			// encoding: 'base64json',
			clearInvalid: true, // remove invalid cookies
			ignoreErrors: true,
			strictHeader: false // do allow violations of RFC 6265
		}
	})
}

function connectHttps() {
	return new Hapi.Server({
		tls,
		host,
		port: 443,
		routes: {
			cors: true
		},
		state: {
			isSameSite: false,
			isHttpOnly: false,
			ttl: 365 * oneDayInMsec,
			isSecure: false,
			// encoding: 'base64json',
			clearInvalid: true, // remove invalid cookies
			ignoreErrors: true,
			strictHeader: false // do allow violations of RFC 6265
		}
	})
}

// redirect http to https
function routeRedirect( server ) {
	function redirect( request, reply ) {
		return reply.redirect( `https://${request.info.host}${request.path}`)
	}
	server.route({ method: 'GET', path: '/', handler: redirect })
	server.route({ method: 'GET', path: '/index.html', handler: redirect })
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
		config: {
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
		method: ['GET', 'PUT', 'POST'], 
		path: `/${version}/{op}`,
		handler: function( request, reply ) {
			const { params: { op }, method } = request  // query also available
			let { payload = {} } = request
			payload = payload || {}	// because hapi sets payload to null instead of undefined

			switch( method ) {
				case 'post': {
					switch( op ) {
						case 'flightplans': {
							debug( 'routeApi', method, op, typeof payload, payload )
							const { name, userId } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							return addFlightPlan( name, userId ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
									// header, 
									// request: payload
								}

								// return reply.response( replyResult )
								debug( 'routeApi promiseFlightPlans then replyResult', replyResult )
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
					switch( op ) {
						case 'flightplans': {
							debug( 'routeApi', op )
							return promiseFlightPlans().then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
									// header, 
									// request: payload
								}

								// return reply.response( replyResult )
								debug( 'routeApi promiseFlightPlans then replyResult', replyResult )
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
			}
		}
	})
}

function routeArgApi( server ) {
	server.route({
		method: ['GET', 'PUT', 'POST'], 
		path: `/${version}/{op}/{id}`,
		handler: function( request, reply ) {
			const { params: { op, id }, method, payload } = request  // query also available
			switch( method ) {
				case 'post': {
					switch( op ) {
						case 'flightplan': {
							const { description, altitude } = typeof payload === 'string' ? JSON.parse( payload ) : payload
							debug( 'routeArgApi post flightplan description, altitude', description, altitude )
							return addRoute( id, description, altitude ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeArgApi post flightplan then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								debug( 'routeArgApi post flightplan error', error.message )
								console.warn( 'routeArgApi post flightplan error', error.message ) 
								return {
									error: `routeArgApi post flightplan/${id} error ${error.message}`
								}
							})
						}
					}
				}
				default: {
					switch( op ) {
						case 'flightplan': {
							return promiseFlightPlan( id ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeArgApi flightplan promiseFlightPlan get then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								console.warn( 'routeArgApi promiseFlightPlan get error', error.message ) 
								return {
									error: `routeArgApi promiseFlightPlan/${id} get error ${error.message}`
								}
							})
						}
						case 'route': {
							return promiseRoute( id ).then( result => {
								const replyResult = {
									status: 'ok', 
									result, 
								}
								debug( 'routeArgApi route promiseRoute get then replyResult', replyResult )
								return replyResult
							}).catch( error => {
								console.warn( 'routeArgApi promiseRoute get error', error.message ) 
								return {
									error: `routeArgApi promiseRoute/${id} get error ${error.message}`
								}
							})
						}
					}
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

if( !noSSL ) {
	const httpsServer = connectHttps()

	httpsServer.register( Inert ).then( () => {
		routeRootAny( httpsServer )
		routeIndexHtml( httpsServer )
		routeApi( httpsServer )
		routeArgApi( httpsServer )
		routeStaticAssets( httpsServer )
		startServer( httpsServer )
	} )
}

const httpServer = connectHttp()

httpServer.register( Inert ).then( () => {
	if( !noRedirect ) {
		routeRedirect( httpServer )
	} else {
		routeRootAny( httpServer )
		routeIndexHtml( httpServer )
		routeApi( httpServer )
		routeArgApi( httpServer )
	}
	routeStaticAssets( httpServer )
	startServer( httpServer )
} )

process.on('unhandledRejection', (err) => {
    console.warn(err);
    process.exit(1);
});

