import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
import {
    requestFlight,
    deleteFlight,
    // deleteRoute,
} from '../actions'
import {
    nameFromFlightId,
    routeIdsFromFlightId,
    routePathFromRouteId,
    routeAltitudeFromRouteId,
    routeSpeedFromRouteId,
    routePointsFromRouteId,
} from '../selectors'
// import AddRoute from './AddRoute'
import './Flight.css'

const stale = () => true // TBD what determines when to refetch stages and status of flight  - always for now

class Flight extends Component {
    constructor(props) {
        super( props )
        this.state = {
            routeIndex: 0
        }
        this.mapRef = React.createRef()
    }

    componentDidMount() {
        const { props } = this
        const {
            id,
            name,
            routeIds,
            requestFlight,
        } = props

        assert( id )

        if( !name || !routeIds || routeIds.length <= 0 || stale() ) {
            requestFlight( id )
        }

        this.setupMap()
    }

    setupMap() {
        const { mapRef } = this
        // index.js does mapboxgl.accessToken = 'pk.eyJ1IjoibGFuY2VwdyIsImEiOiJja2ZpamE2NGIwMHBnMzhxdTJpYXd3Z3g5In0.aC7y-RlHNxdFXi5UgpagMA';
        if( mapRef.current ) {
            this._map = new mapboxgl.Map({
                container: mapRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-122.486052, 37.830348],
                zoom: 15
            });
            this._map.on( 'load', () => this.updateMap() )
        }
    }

    deleteFlight = () => {
        const { props } = this
        const { id, deleteFlight } = props
        deleteFlight( id )
    }

    // deleteRoute = () => {
    //     const { props, state } = this
    //     const { deleteRoute, routeIds, id } = props
    //     const { routeIndex } = state
    //     const routeId = routeIds[ routeIndex ]
    //     deleteFlight( id, routeId )
    // }

    previous = () => {
        const { props, state } = this
        const { routeIds } = props
        const numRoutes = routeIds.length
        const { routeIndex } = state
        this.setState( { routeIndex: ( numRoutes + ( routeIndex - 1 ) % numRoutes ) % numRoutes } )
    }

    next = () => {
        const { props, state } = this
        const { routeIds } = props
        const numRoutes = routeIds.length
        const { routeIndex } = state
        this.setState( { routeIndex: ( routeIndex + 1 ) % numRoutes } )
    }

    updateMap = () => {
        const { _map: map, props, state } = this
        const { routeIndex } = state
        const { routeIds, routePointsFromRouteIdSelector } = props
        const routeId = routeIds[ routeIndex ]
        const points = routeId ? routePointsFromRouteIdSelector( routeId ) : []
        const coordinates = points.filter( p => p.lat && p.lon ).map( p => [ p.lon, p.lat ] )

        if( map && map.loaded() && map.isStyleLoaded() && coordinates && coordinates.length ) {
            if( map.getLayer( 'route' ) ) {
                map.removeLayer('route')
            }
            if( map.getSource( 'route' ) ) {
                map.removeSource('route')
            }

            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        coordinates
                    }
                }
            })
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 8
                }
            })

            map.flyTo({
                center: coordinates[ 0 ]
            });
        }
    }

    renderRoute = () => {
        this.updateMap()

        // return (
        //     <React.Fragment>
        //         <div>{JSON.stringify( points )}</div>
        //     </React.Fragment>
        // )
    }

    componentWillReceiveProps( nextProps ) {
        const { routeIds = [] } = this.props
        const { routeIds: nextRouteIds = [] } = nextProps
        if ( routeIds.length !== nextRouteIds.length && nextRouteIds.length ) {
            this.setState( { routeIndex: nextRouteIds.length - 1 } )
            // this.updateMap()
        }
    }

    render() {
        // const { props, state, renderRoute, previous, next, deleteFlight } = this
        const { props, state, renderRoute, deleteFlight } = this
        const { routeIndex } = state
        // const { id, name, routeIds, routePathFromRouteIdSelector, routeAltitudeFromRouteIdSelector, routeSpeedFromRouteIdSelector, userId } = props
        const { name, routeIds, routePathFromRouteIdSelector, routeAltitudeFromRouteIdSelector, routeSpeedFromRouteIdSelector, userId } = props
        const routeId = routeIds[ routeIndex ]
        // const numRoutes = routeIds.length
        let path = 'none'
        let altitude = 0
        let speed = 0
        // let routeIndexDisplay = -1
        if( routeId ) {
            path = routePathFromRouteIdSelector( routeId )
            altitude = routeAltitudeFromRouteIdSelector( routeId )
            speed = routeSpeedFromRouteIdSelector( routeId )
            // routeIndexDisplay = routeIndex
        }
                    // Route: <div className="flight-path">{path}</div> ({ routeIndexDisplay + 1 } / { numRoutes })
                    // <button onClick={previous}>&lsaquo;</button>
                    // <button onClick={next}>&rsaquo;</button>
                    // <AddRoute id={id} />
        return (
            <div className="flight">
                <div className="flight-header">
                    Flight : <b>{name}</b>
                    Path: <div className="flight-path">{path}</div> 
                    Altitude: <div className="flight-path">{altitude}</div> 
                    Speed: <div className="flight-path">{speed}</div> 
                </div>
                <div className="flight-body">
                    { renderRoute() }
                </div>
                <div id="mapbox" className="flight-mapContainer" ref={this.mapRef}></div>
                { userId === 1 && <button className="flight-delete" onClick={deleteFlight}>Delete this flight </button> }
            </div>
        )
    }
}

const mapStateToProps = ( state, props ) => {
    const { match: { params } } = props
    const { id } = params
    const flightId = +id
    const name = nameFromFlightId( state, flightId ) || flightId
    const routeIds = routeIdsFromFlightId( state, flightId )
    const routePathFromRouteIdSelector = id => routePathFromRouteId( state, id )
    const routePointsFromRouteIdSelector = id => routePointsFromRouteId( state, id )
    const routeAltitudeFromRouteIdSelector = id => routeAltitudeFromRouteId( state, id )
    const routeSpeedFromRouteIdSelector = id => routeSpeedFromRouteId( state, id )
    const { userId: userIdKey } = state
    const userId = +userIdKey

    return {
        id: flightId,
        userId,
        name,
        routeIds,
        routePathFromRouteIdSelector,
        routePointsFromRouteIdSelector,
        routeAltitudeFromRouteIdSelector,
        routeSpeedFromRouteIdSelector,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        requestFlight: id => {
            dispatch( requestFlight( id ) )
        },
        deleteFlight: id => {
            dispatch( deleteFlight( id ) )
        },
        // deleteRoute: ( fpid, rid ) => {
        //     dispatch( deleteRoute( fpid, rid ) )
        // }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Flight)
