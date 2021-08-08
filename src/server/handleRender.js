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
import { requestPoints } from '../actions'
                       
const middleware = [ thunk ]
const composeEnhancers = compose;
const enhancer = composeEnhancers(
        applyMiddleware(...middleware),
)

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
    const store = createStore(rootReducer, initialState, enhancer)

    const hostname = request.info.hostname.toLowerCase()
    const url = `https://${request.info.host}${request.url.path}` // req.url available?

    let responsePromise = new Promise( ( resolve, /*reject*/ ) => {

        try {
            store.dispatch( requestPoints( ) ) 

            const unsubscribe = store.subscribe( () => {

                // Grab the initial state from our store after initial fetch
                const preloadedState = store.getState()
                const { tests } = preloadedState

                // is there some better way to detect when the fetchItems action has finished processing into state?
                // if( lastAction.type === XXX_RECEIVED ) { // } || lastAction.type === RECEIVE_ITEMS_FAILED ) {
                if( Object.keys( tests ).length > 0 ) { // } || lastAction.type === RECEIVE_ITEMS_FAILED ) {
                    const { info: { host: h }, url: { pathname: p }, query: q } = request
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
                    // waiting ... 
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

export default handleRender


