import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
import {
    requestFlightPlan,
    deleteFlightPlan,
    // deleteRoute,
} from '../actions'
import {
    nameFromFlightPlanId,
    routeIdsFromFlightPlanId,
    routePathFromRouteId,
    routeAltitudeFromRouteId,
    routeSpeedFromRouteId,
    routePointsFromRouteId,
} from '../selectors'
// import AddRoute from './AddRoute'
import './FlightPlan.css'

const stale = () => true // TBD what determines when to refetch stages and status of flight plan - always for now

class FlightPlan extends Component {
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
            requestFlightPlan,
        } = props

        assert( id )

        if( !name || !routeIds || routeIds.length <= 0 || stale() ) {
            requestFlightPlan( id )
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

    deleteFlightPlan = () => {
        const { props } = this
        const { id, deleteFlightPlan } = props
        deleteFlightPlan( id )
    }

    // deleteRoute = () => {
    //     const { props, state } = this
    //     const { deleteRoute, routeIds, id } = props
    //     const { routeIndex } = state
    //     const routeId = routeIds[ routeIndex ]
    //     deleteFlightPlan( id, routeId )
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
        // const { props, state, renderRoute, previous, next, deleteFlightPlan } = this
        const { props, state, renderRoute, deleteFlightPlan } = this
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
                    // Route: <div className="flightPlan-path">{path}</div> ({ routeIndexDisplay + 1 } / { numRoutes })
                    // <button onClick={previous}>&lsaquo;</button>
                    // <button onClick={next}>&rsaquo;</button>
                    // <AddRoute id={id} />
        return (
            <div className="flightPlan">
                <div className="flightPlan-header">
                    Flight Plan: <b>{name}</b>
                    Path: <div className="flightPlan-path">{path}</div> 
                    Altitude: <div className="flightPlan-path">{altitude}</div> 
                    Speed: <div className="flightPlan-path">{speed}</div> 
                </div>
                <div className="flightPlan-body">
                    { renderRoute() }
                </div>
                <div id="mapbox" className="flightPlan-mapContainer" ref={this.mapRef}></div>
                { userId === 1 && <button className="flightPlan-delete" onClick={deleteFlightPlan}>Delete this flight plan</button> }
            </div>
        )
    }
}

const mapStateToProps = ( state, props ) => {
    const { match: { params } } = props
    const { id } = params
    const flightPlanId = +id
    const name = nameFromFlightPlanId( state, flightPlanId ) || flightPlanId
    const routeIds = routeIdsFromFlightPlanId( state, flightPlanId )
    const routePathFromRouteIdSelector = id => routePathFromRouteId( state, id )
    const routePointsFromRouteIdSelector = id => routePointsFromRouteId( state, id )
    const routeAltitudeFromRouteIdSelector = id => routeAltitudeFromRouteId( state, id )
    const routeSpeedFromRouteIdSelector = id => routeSpeedFromRouteId( state, id )
    const { userId: userIdKey } = state
    const userId = +userIdKey

    return {
        id: flightPlanId,
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
        requestFlightPlan: id => {
            dispatch( requestFlightPlan( id ) )
        },
        deleteFlightPlan: id => {
            dispatch( deleteFlightPlan( id ) )
        },
        // deleteRoute: ( fpid, rid ) => {
        //     dispatch( deleteRoute( fpid, rid ) )
        // }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlightPlan)
