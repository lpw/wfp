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
    routeDescriptionFromRouteId,
    routePointsFromRouteId,
} from '../selectors'
import AddRoute from './AddRoute'
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
        const { props, state, renderRoute, previous, next, deleteFlightPlan } = this
        const { routeIndex } = state
        const { id, name, routeIds, routeDescriptionFromRouteIdSelector, userId } = props
        const routeId = routeIds[ routeIndex ]
        const numRoutes = routeIds.length
        let description = 'none'
        let routeIndexDisplay = -1
        if( routeId ) {
            description = routeDescriptionFromRouteIdSelector( routeId )
            routeIndexDisplay = routeIndex
        }
        return (
            <div className="flightPlan">
                <div className="flightPlan-header">
                    Flight Plan: <b>{name}</b>
                    Route: <div className="flightPlan-description">{description}</div> ({ routeIndexDisplay + 1 } / { numRoutes })
                    <button onClick={previous}>&lsaquo;</button>
                    <button onClick={next}>&rsaquo;</button>
                </div>
                <div className="flightPlan-body">
                    { renderRoute() }
                </div>
                <div id="mapbox" className="flightPlan-mapContainer" ref={this.mapRef}></div>
                <AddRoute id={id} />
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
    const routeDescriptionFromRouteIdSelector = id => routeDescriptionFromRouteId( state, id )
    const routePointsFromRouteIdSelector = id => routePointsFromRouteId( state, id )
    const { userId: userIdKey } = state
    const userId = +userIdKey

    return {
        id: flightPlanId,
        userId,
        name,
        routeIds,
        routeDescriptionFromRouteIdSelector,
        routePointsFromRouteIdSelector
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
