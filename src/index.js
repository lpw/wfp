import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import createRootReducer from './reducers'
import { ConnectedRouter } from 'connected-react-router'
import { createBrowserHistory } from 'history';
import mapboxgl from 'mapbox-gl'	// instead of <script src="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js"></script>
import socketIOClient from "socket.io-client"

import './index.css';
import App from './web/App';

import {
	updateTelemetry,
	requestPoints,
	requestFleet,
	requestRoutes,
} from './actions'

mapboxgl.accessToken = 'pk.eyJ1IjoibGFuY2VwdyIsImEiOiJja2ZpamE2NGIwMHBnMzhxdTJpYXd3Z3g5In0.aC7y-RlHNxdFXi5UgpagMA';

const history = createBrowserHistory();
const localhost = ( window.location.hostname.match( new RegExp( 'localhost', 'gi' ) ) || [] ).length > 0

// for server-side render, which generates preloadedState,
// to initialize the store, which will then match the HTML markup that in the initial response
// Grab the state from a global variable injected into the server-generated HTML
let preloadedState = window.__PRELOADED_STATE__ || {}

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__

const middleware = [ thunk, routerMiddleware(history) ]
const composeEnhancers =
    localhost &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            name: 'LLHMSH', actionsBlacklist: ['REDUX_STORAGE_SAVE']
        }) : compose;
const enhancer = composeEnhancers(
    applyMiddleware(...middleware),
)

const store = createStore( createRootReducer(history), preloadedState, enhancer )

window._laStore = store

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
		    <ConnectedRouter history={history}>
				<App />
		    </ConnectedRouter>
		</Provider>
	</React.StrictMode>,
	document.getElementById('root')
)

// const socket = socketIOClient( 'http://127.0.0.1:7400', {
const socket = socketIOClient( 'http://gas:7400', {
	// withCredentials: true,
})

store.dispatch( requestPoints() )
store.dispatch( requestFleet() )
store.dispatch( requestRoutes() )

socket.on( 'cora', telemetry => {
	// setTimeout( () => {	// trying to prevent React node remove error
	if( telemetry.change ) {
		store.dispatch( requestPoints() )
		store.dispatch( requestFleet() )
		store.dispatch( requestRoutes() )
	}
	store.dispatch( updateTelemetry( telemetry, Date.now() ) )
	// }, 1 )
})
