import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
import {
    requestFleet,
    requestPoints,
} from '../actions'
import {
} from '../selectors'
import SuperviseFlyingAircraft from './SuperviseFlyingAircraft'
import SuperviseParkedAircraft from './SuperviseParkedAircraft'
import './Supervise.css'

const stale = () => true // TBD what determines when to refetch stages and status of supervise  - always for now

const oneHasSomeOther = ( one, other ) => one.some( id => other.includes( id ) )
const markerHasSelectedAircraft = ( marker, selectedAircraftIds ) => oneHasSomeOther( marker.aircraftIds, selectedAircraftIds )
const pathHasSelectedAircraft = ( path, selectedAircraftIds ) => oneHasSomeOther( path.aircraftIds, selectedAircraftIds )
const removeMarkersAircraft = ( marker, selectedAircraftIds ) => selectedAircraftIds.filter( id => !marker.aircraftIds.includes( id ) )
const addMarkersAircraft = ( marker, selectedAircraftIds ) => selectedAircraftIds.concat( marker.aircraftIds )

const getMarker = ( aircraftId, fleet, points ) => {
    let marker
    const aircraft = fleet[ aircraftId ]
    if( aircraft ) {
        const pointId = aircraft.origin || aircraft.base
        const point = points[ pointId ]
        if( point ) {   // && point.lat && point.lon ) {
            const coord = [ point.lon, point.lat ]
            marker = {
                aircraftId,
                pointId,
                point,
                coord,
                name: aircraft.name,
            }
        }
    }
    return marker
}

const getMarkers = ( fleet, points ) => {
    const markers = Object.keys( fleet ).map( k => fleet[ k ]).reduce( ( msf, aircraft )=> {
        const pointId = aircraft.origin || aircraft.base
console.log( 'LANCE getMarkers msf', msf )
        const colocatedMsf = Object.keys( msf ).map( k => msf[ k ] ).find( m => m.pointId === pointId )
        if( colocatedMsf ) {
            msf = {
                ...msf,
                [ colocatedMsf.id ]: {
                    ...colocatedMsf, // id, pointId...
                    name: `${colocatedMsf.name}, ${aircraft.name}`,
                    aircraftIds: colocatedMsf.aircraftIds.concat( aircraft.id ),
                }
            }
        } else {
            const id = Object.keys( msf ).length
            const point = points[ pointId ]
            if( point ) {   // && point.lat && point.lon ) {
                const coord = [ point.lon, point.lat ]
                msf = {
                    ...msf,
                    [ id ]: {
                        id,
                        pointId,
                        point,
                        coord,
                        name: aircraft.name,
                        aircraftIds: [ aircraft.id ],
                    }
                }
            }
        }
        return msf
    }, {})

    return markers
}

const getPaths = ( fleet, points ) => {
    const paths = Object.keys( fleet ).map( k => fleet[ k ]).reduce( ( psf, aircraft )=> {
        if( aircraft.origin || aircraft.base ) {
            const originPointId = aircraft.origin || aircraft.base
            const destinationPointId = aircraft.destination
            const originPoint = points[ originPointId ]
            const destinationPoint = points[ destinationPointId ]
            const originCoord = originPoint && [ originPoint.lon, originPoint.lat ]
            const destinationCoord = destinationPoint && [ destinationPoint.lon, destinationPoint.lat ]
            if( originPointId && destinationPointId 
                    && originPointId !== destinationPointId
                    && originPoint && destinationPoint
            ) {
                // const colocatedPsf = Object.keys( psf ).map( k => psf[ k ] ).find( p => p.originPointId === originPointId && p.destinationPointId === destinationPointId )
                const id = `${originPointId}-${destinationPointId}`
                const colocatedPsf = psf[ id ]
                if( colocatedPsf ) {
                    psf = {
                        ...psf,
                        [ colocatedPsf.id ]: {
                            ...colocatedPsf, // id, pointId...
                            // name: `${colocatedPsf.name}, ${aircraft.name}`,
                            aircraftIds: colocatedPsf.aircraftIds.concat( aircraft.id ),
                        }
                    }
                } else {
                    psf = {
                        ...psf,
                        [ id ]: {
                            id,
                            originPointId,
                            destinationPointId,
                            originPoint,
                            destinationPoint,
                            originCoord,
                            destinationCoord,
                            aircraftIds: [ aircraft.id ],
                        }
                    }
                }
            }
        }
        return psf
    }, {})
    return paths
}

class Supervise extends Component {
    constructor(props) {
        super( props )
        const { selectedAircraftIds } = props

        this._mapRef = React.createRef()
        this._markers = {}

        this._sources = []
        this._layers = []

        this.state = {
            selectedAircraftIds,
        }

        this._initialMapRendered = false
    }

    setRef = ( el, marker ) => {
        console.log( 'LANCE setRef el', el )
        console.log( 'LANCE setRef marker.el', marker.el )
        console.log( 'LANCE setRef marker.el === el', marker.el === el )
        console.log( 'LANCE setRef marker', marker )
        marker.el = el
    }

    componentDidMount() {
        const { props } = this
        const {
            markers,
            points,
            requestFleet,
            requestPoints,
        } = props

        if( markers.length <= 0 || stale() ) {
            requestFleet()
        }

        if( Object.keys( points ).length <= 0 || stale() ) {
            requestPoints()
        }

        this.setupMap()
    }

    clickMarker = marker => {
        console.log( 'LANCE clickMarker marker', marker )
        const { state } = this
        const { selectedAircraftIds } = state
        const markerSelected = markerHasSelectedAircraft( marker, selectedAircraftIds )
        if( markerSelected ) {
            this.setState({
                selectedAircraftIds: removeMarkersAircraft( marker, selectedAircraftIds )
            })
        } else {
            this.setState({
                selectedAircraftIds: addMarkersAircraft( marker, selectedAircraftIds )
            })
        }
    }

    close = id => {
        const { state } = this
        const { selectedAircraftIds } = state

        console.log( 'LANCE close id', id )
        console.log( 'LANCE close selectedAircraftIds', selectedAircraftIds )

        this.setState({
            selectedAircraftIds: selectedAircraftIds.filter( said => said !== id )
        })
    }

    setupMap() {
        const { _mapRef } = this
        // const { fleet } = props
        // index.js does mapboxgl.accessToken = 'pk.eyJ1IjoibGFuY2VwdyIsImEiOiJja2ZpamE2NGIwMHBnMzhxdTJpYXd3Z3g5In0.aC7y-RlHNxdFXi5UgpagMA';
        if( _mapRef.current ) {
            this._map = new mapboxgl.Map({
                container: _mapRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-122.486052, 37.830348],
                zoom: 15
            });
            this._map.on( 'load', () => this.updateMap() )
            // this._marker = fleet.map( f => new mapboxgl.Marker( this._markerRef[ f.name ].current ) ).reduce( ( a, m ) => ({ [ ]}))
        }
    }

    updateMap = routes => {
        const { _map: map, props, state } = this
        const { selectedAircraftIds } = state
        // const { fleet, aircraftInfoSelector } = props
        const { markers, paths, boundingBox, flyToCoord } = props
console.log( 'LANCE markers', markers )
console.log( 'LANCE paths', paths )

        if( map && map.loaded() && map.isStyleLoaded() ) {
            this._layers.map( layer => map.removeLayer( layer ) )
            this._sources.map( source => map.removeSource( source ) )
            this._layers = []
            this._sources = []

            Object.keys( markers ).map( k => markers[ k ] ).map( m => {
                // const aircraftInfo = aircraftInfoSelector( f.id )
                // const points = aircraftInfo.points.filter( p => p.lat && p.lon )
                // const coordinates = points.map( p => [ p.lon, p.lat ] )
                const { id, coord } = m

                const source = `marker${id}`
                // const layer = `marker${id}`

                this._sources = this._sources.concat( source )
                // this._layers = this._layers.concat( layer )

console.log( 'LANCE marker', source, coord[0], coord[1] )
                map.addSource( source, {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        // 'properties': {},
                        'geometry': {
                            'type': 'Point',
                            coordinates: coord
                        }
                    }
                })

                if( !m.mbmarker ) {
                    assert( m.el )
                    // m.mbmarker = new mapboxgl.Marker( m.el )
                    m.mbmarker = new mapboxgl.Marker( m.el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
                    m.mbmarker.setLngLat( coord ).addTo( map )
console.log( 'LANCE updateMap newMarker id, coord, m.mbmarker, m', id, coord, m.mbmarker, m )
                } else {
                    m.mbmarker.setLngLat( coord )
console.log( 'LANCE updateMap setLngLat id, coord, m.mbmarker, m', id, coord, m.mbmarker, m )
                }

                return null
            })

            Object.keys( paths ).map( k => paths[ k ] ).map( p => {
                const { id, originCoord, destinationCoord, selected } = p
                const highlighted = oneHasSomeOther( p.aircraftIds, selectedAircraftIds )
                // const coordinates = originCoord && destinationCoord && [ originCoord, destinationCoord ]
                const coordinates = [ originCoord, destinationCoord ]

                const source = `path${id}`
                const layer = `path${id}`

                this._sources = this._sources.concat( source )
                this._layers = this._layers.concat( layer )

console.log( 'LANCE line source, coordinates', source, coordinates )
                map.addSource( source, {
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
                    'id': layer,
                    'type': 'line',
                    'source': source,
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': highlighted ? '#00F' : '#888',
                        'line-width': 8
                    }
                })

                return null
            })

            if( !this._initialMapRendered ) {
                if( flyToCoord && !this._initialMapRendered ) {
    console.log( 'LANCE flyToCoord', flyToCoord, flyToCoord && flyToCoord[0], flyToCoord && flyToCoord[1] )
                    map.flyTo({
                        center: flyToCoord
                    })
                    // this._marker.setLngLat( flyToCoord ).addTo( map )
                } else if( boundingBox ) {
    console.log( 'LANCE fitBounds boundingBox', boundingBox )
                    map.fitBounds( boundingBox )
                }
            this._initialMapRendered = true
            }
        }
    }

    renderMarker = m => {
        const { setRef, clickMarker, state } = this
        const { selectedAircraftIds } = state
        const markerAndNamesSelected = markerHasSelectedAircraft( m, selectedAircraftIds )
        const markerClassNames = classNames( 
            'markerAndNames', 
            // append to external/existing classesNames from lib like mapbox via React/classNames?
            'mapboxgl-marker',
            'mapboxgl-marker-anchor-top',
            { markerAndNamesSelected } 
        )
        return (
            <div key={ m.id } className={ markerClassNames } ref={ el => setRef( el, m ) } onClick={ () => clickMarker( m ) }>
                <div className="marker"></div>
                <div className="markerNames">
                    { m.name }
                </div>
            </div>
        )
    }

    renderSelectedAircraft = id => {
        const { props, close } = this
        const { fleet, points } = props
        const aircraft = fleet[ id ]
        // const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
console.log( 'LANCE renderSelectedAircraft id, fleet[ id ]', id, fleet[ id ] )
console.log( 'LANCE renderSelectedAircraft Object.keys( points ).length', Object.keys( points ).length )
        if( aircraft && Object.keys( points ).length > 0 ) {
            const { base, origin, destination } = aircraft
            const originPoint = points[ origin || base ]
            const destinationPoint = points[ destination ]
console.log( 'LANCE renderSelectedAircraft originPoint', originPoint )
            // if( !originPoint ) {
            //     console.warn( `missing originPoint for ${origin}`)
            // }
            assert( originPoint )
            if( destinationPoint ) {
                // return renderFlyingSelectedAircraft( id, originPoint, destinationPoint )
                return <SuperviseFlyingAircraft key={ id } id={id} originPoint={originPoint} destinationPoint={destinationPoint} close={ close } fleet={ fleet }/>
            } else {
                // return renderParkedSelectedAircraft( id, originPoint )
                return <SuperviseParkedAircraft key={ id } id={id} originPoint={originPoint} close={ close } fleet={ fleet }/>
            }
        }
    }

    render() {
        const { updateMap, props, state, renderMarker, renderSelectedAircraft } = this
        // const { routeIndex } = state
        const { markers } = props
        const { selectedAircraftIds } = state

        return (
            <div className="supervise">
                <div className="supervise-body">
                    { updateMap() }
                </div>
                <div id="mapbox" className="supervise-mapContainer" ref={this._mapRef}></div>
                { Object.keys( markers ).map( k => markers[ k ] ).map( renderMarker ) }
                { selectedAircraftIds.map( renderSelectedAircraft ) }
            </div>
        )
    }
}

const mapStateToProps = ( state, props ) => {
    const { fleet, points } = state
    const { location: { search } } = props
    const selectedAircraftIds = ( new URLSearchParams( search ).getAll( 'a' ) || [] ).map( said => +said )
    console.log( 'LANCE selectedAircraftIds', selectedAircraftIds )

    const markers = getMarkers( fleet, points )
    const paths = getPaths( fleet, points )
    let flyToCoord

    if( selectedAircraftIds && selectedAircraftIds.length > 0 ) {
        const marker = getMarker( selectedAircraftIds[ 0 ], fleet, points )
        if( marker ) {
            flyToCoord = marker.coord
        }
    }

    let boundingBox
    const coords = Object.keys( markers ).map( k => markers[ k ].coord ).concat(
        Object.keys( paths ).map( k => paths[ k ].originCoord ) ).concat(
        Object.keys( paths ).map( k => paths[ k ].destinationCoord ) )
    if( coords.length ) {
        let north = Math.max( ...coords.map( c => c[ 1 ] ) )
        let south = Math.min( ...coords.map( c => c[ 1 ] ) )
        let west = Math.min( ...coords.map( c => c[ 0 ] ) )
        let east = Math.max( ...coords.map( c => c[ 0 ] ) )
        north = Math.min( north + 0.1 * ( north - south ), 90 )
        south = Math.max( south - 0.2 * ( north - south ), -90 )    // a little more for labels
        west = Math.max( west - 0.1 * ( east - west ), -180 )
        east = Math.min( east + 0.1 * ( east - west ), 180 )
        const southWest = new mapboxgl.LngLat( west, south )
        const northEast = new mapboxgl.LngLat( east, north )
        boundingBox = new mapboxgl.LngLatBounds( southWest, northEast )
    }

    return {
        fleet,
        markers,
        paths,
        points,
        selectedAircraftIds,
        boundingBox,
        flyToCoord,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        requestFleet: () => {
            dispatch( requestFleet() )
        },
        requestPoints: () => {
            dispatch( requestPoints() )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Supervise)
