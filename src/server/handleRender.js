// server-side only
// const assert = require('assert')
// const debug = require('debug')('medopia:handleRender')
import React from 'react';
import App from '../web/App';
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from '../reducers'
import { renderToString } from 'react-dom/server'
import fs from 'fs';
import { StaticRouter as Router } from 'react-router-dom';
import { requestTestPlans } from '../actions'
                       
const middleware = [ thunk ]
const composeEnhancers = compose;
const enhancer = composeEnhancers(
        applyMiddleware(...middleware),
)

// const cssDir = fs.readdirSync( './build/static/css/', 'utf8' )
// const cssFileNames = cssDir.filter( n => n.endsWith('.css'))
// const css = cssFileNames.map( cssFileName => fs.readFileSync( `./build/static/css/${cssFileName}`, 'utf8' ) ).join( '\n' )
// let canonicalQueryParamString = ''

const indexHtml = fs.readFileSync( './build/index.html', 'utf8' )

const preloadedDataKey = '__PRELOADED_DATA__'

const initialState = {}

function renderFullPage( html, preloadedState ) {
    const preloadedData = `window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}`
    const indexHtmlPreloaded = indexHtml.replace( preloadedDataKey, preloadedData )

    return indexHtmlPreloaded
}

function handleRender({
    request,
    reply,
}) {
    // Create a new Redux store instance
    const store = createStore(rootReducer, initialState, enhancer)

    const hostname = request.info.hostname.toLowerCase()
    const url = `https://${request.info.host}${request.url.path}` // req.url available?

    let responsePromise = new Promise( ( resolve, /*reject*/ ) => {

        try {
            store.dispatch( requestTestPlans( ) ) 

            const unsubscribe = store.subscribe( () => {

                // Grab the initial state from our store after initial fetch
                const preloadedState = store.getState()
                const { testPlans } = preloadedState

                // debug( 'handleRender preloadedState', preloadedState )
                // debug( 'handleRender header', preloadedState.header )
                // preloadedState.items = []
                
                // is there some better way to detect when the fetchItems action has finished processing into state?
                // if( lastAction.type === RISKS_RECEIVED ) { // } || lastAction.type === RECEIVE_ITEMS_FAILED ) {
                if( Object.keys( testPlans ).length > 0 ) { // } || lastAction.type === RECEIVE_ITEMS_FAILED ) {
                    const { info: { host: h }, url: { pathname: p }, query: q } = request
                    // const { host: h } = info
                    // const h = `https://${host}` port (not hostname), but not including origin or protocol
                    // const { pathname: p } = url // or could use request.path which also does not have query params
                    const url = { h, p, q }

                    const html = renderToString(
                        <Provider store={store}>
                            <Router location={url} context={{}}>
                                <App />
                            </Router>
                        </Provider>,
                    )

                    const fullPage = renderFullPage( html, preloadedState, hostname, url )

                    // Send the rendered page back to the client
                    const response = reply.response( fullPage )

                    unsubscribe()

                    resolve( response )
                } else {
                    // waiting for test plans... 
                }
            } )
        }

        // but more likely than catching an error is hanging in above subscribe waiting
        catch(e) {
            // debug( 'handleRender caught error', e )

            const html = '';
            const preloadedState = store.getState()
            const fullPage = renderFullPage( html, preloadedState, hostname, url )

            // Send the empty error but rendered page back to the client
            const response = reply.response( fullPage )

            resolve( response )
        }
    })

    return responsePromise
}

// module.exports = handleRender
export default handleRender


