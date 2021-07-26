import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
// import turf from 'turf'
import * as turf from '@turf/turf'
import socketIOClient from "socket.io-client"
import {
    requestFleet,
    // requestPoints,
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

const getMarker = ( aircraftId, fleet, telemetryData = {} ) => {
    let marker
    const aircraft = fleet[ aircraftId ]
    const aircraftTelemetry = telemetryData[ aircraftId ]
    const aircraftWithTelemtry = { ...aircraft, ...aircraftTelemetry }
    const { baseId, originId, lat, lon } = aircraftWithTelemtry
    // assert( aircraft )
    if( aircraft ) {
        // const pointId = aircraft.originId || aircraft.baseId
        // let pointId 
        // let point
        let coord 

        if( lat && lon ) {
            coord = [ lon, lat ]
        } else if( aircraft.baseLat && aircraft.baseLon ) {
            coord = [ aircraft.baseLon, aircraft.baseLat ]
        } else {
            console.warn( 'no coord/point/id for', aircraft )
        }

        if( coord ) {   
            marker = {
                // aircraftId,
                // pointId,
                // point,
                coord,
                name: aircraft.name,
            }
        }
    }

    console.log( 'LANCE marker', marker )

    return marker
}

const getMarkers = ( fleet ) => {
    const markers = Object.keys( fleet ).map( k => fleet[ k ]).reduce( ( msf, aircraft )=> {
        // const pointId = aircraft.originId || aircraft.baseId
console.log( 'LANCE getMarkers msf', msf )
        // const colocatedMsf = Object.keys( msf ).map( k => msf[ k ] ).find( m => m.pointId === pointId )
        const colocatedMsf = Object.keys( msf ).map( k => msf[ k ] ).find( m => m.lat === aircraft.lat && m.lon === aircraft.lon )
        if( colocatedMsf ) {
            msf = {
                ...msf,
                [ colocatedMsf.id ]: {
                    ...colocatedMsf, // id, pointId...
                    name: `${colocatedMsf.name}, ${aircraft.name}`,
                    aircraftIds: colocatedMsf.aircraftIds.concat( aircraft.id ),
                }
            }
        } else if( aircraft.lat && aircraft.lon ){
            const id = Object.keys( msf ).length
            // const point = points[ pointId ]
            // toconsider: backup aircraft lat/lon with route/origin lat/lon
            const coord = [ aircraft.lon, aircraft.lat ]
            msf = {
                ...msf,
                [ id ]: {
                    id,
                    // pointId,
                    // point,
                    coord,
                    name: aircraft.name,
                    aircraftIds: [ aircraft.id ],
                }
            }
        }
        return msf
    }, {})

    return markers
}

const getUpdatedMarkers = ( markers, data ) => {
    let newMarrkers = markers

    const markerId = Object.keys( markers ).find( k => markers[ k ].aircraftIds.includes( data.id ) )
    const marker = markers[ markerId ]

    if( !marker ) {
        console.warn( 'getUpdatedMarkers could not find aircraft', data, markers )
    } else {
        if( marker.aircraftIds.length < 1 ) {
            assert( marker.aircraftIds.length > 0 )
        } else if( marker.aircraftIds.length === 1 ) {
            newMarrkers = {
                ...markers,
                [ marker.id ]: {
                    ...marker,
                    coord: [ data.lon, data.lat ],
                }
            }
        } else if( marker.aircraftIds.length > 1 ) {
            const id = Object.keys( markers ).length
            newMarrkers = {
                ...markers,
                [ marker.id ]: {
                    ...marker,
                    aircraftIds: marker.aircraftIds.filter( i => i !== data.id )
                },
                // could check coords again for confluence
                [ id ]: {
                    ...marker,
                    aircraftIds: [ data.id ],
                    coord: [ data.lon, data.lat ],
                }
            }
        }
    }

    return newMarrkers
}

const getPaths = ( fleet ) => {
    const paths = Object.keys( fleet ).map( k => fleet[ k ]).reduce( ( psf, aircraft )=> {
        // const originPointId = aircraft.originId || aircraft.baseId
        // const destinationPointId = aircraft.destinationId
        // const originPoint = points[ originPointId ]
        // const destinationPoint = points[ destinationPointId ]
        // const originCoords = originPoint && [ originPoint.lon, originPoint.lat ]
        // const destinationCoords = destinationPoint && [ destinationPoint.lon, destinationPoint.lat ]
        const { originLat, originLon, destinationLat, destinationLon } = aircraft
        if( typeof destinationLat === 'number' && typeof destinationLon === 'number' ) {
            const originCoords = [ originLon, originLat ]
            const destinationCoords = [ destinationLon, destinationLat ]
            // const colocatedPsf = Object.keys( psf ).map( k => psf[ k ] ).find( p => p.originPointId === originPointId && p.destinationPointId === destinationPointId )
            const id = `${originCoords}-${destinationCoords}`
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
                        // originPointId,
                        // destinationPointId,
                        // originPoint,
                        // destinationPoint,
                        originCoords,
                        destinationCoords,
                        aircraftIds: [ aircraft.id ],
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

        this._sources = []
        this._layers = []

        this.state = {
            selectedAircraftIds,
            fleet: {}
        }

        this._initialMapRendered = false

        this._markers = props.markers
    }

    setRef = ( el, marker ) => {
        console.log( 'LANCE setRef el', el )
        console.log( 'LANCE setRef marker.el', marker.el )
        console.log( 'LANCE setRef marker.el === el', marker.el === el )
        console.log( 'LANCE setRef marker', marker )
        marker.el = el
    }

    componentDidMount() {
        const { props, updateAircraft, _markers: markers } = this
        const {
            // markers,
            // points,
            requestFleet,
            // requestPoints,
        } = props

        if( markers.length <= 0 || stale() ) {
            requestFleet()
        }

        // if( Object.keys( points ).length <= 0 || stale() ) {
        //     requestPoints()
        // }

        this.setupMap()

        if( !this._socket ) {
            this._socket = socketIOClient( 'http://127.0.0.1:7400', {
                withCredentials: true,
                // extraHeaders: {
                //     "my-custom-header": "abcd"
                // }
            })
            this._socket.on( 'cora', data => {
              // coratype.innerHTML = 'Cora'
              updateAircraft( data )
            })
        }
    }

    componentWillReceiveProps( nextProps ) {
        this._markers = nextProps.markers
console.log( 'Supervise componentWillReceiveProps this._markers', this._markers )
    }

    updateAircraft = data => {
        console.log( 'LANCE updateAircraft data', data )

        const now = Date.now()

        const { props, moveMarkers } = this
        const {
            markers,
        } = props

        this.setState({
            fleet: {
                ...this.state.fleet,
                [ data.id ]: {
                    ...this.state.fleet[ data.id ],
                    ...data,
                    time: now,
                }
            }
        })

        this._markers = getUpdatedMarkers( this._markers, data ) 

        // this._telemetryData = {
        //     ...this._telemetryData,
        //     [ data.id ]: {
        //         ...this._telemetryData[ data.id ],
        //         ...data,
        //         time: now,
        //     }
        // }

        moveMarkers()
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

    goMap = id => {
        const { props } = this
        const { name } = props

        const { state } = this
        const { fleet: telemetryData } = state
        const aircraftTelemetry = telemetryData[ id ]

        console.log( `goMap flying to ${id} with ${aircraftTelemetry}`)

        if( aircraftTelemetry ) {
            this._map.flyTo({
                center: [ aircraftTelemetry.lon, aircraftTelemetry.lat ],
                zoom: 22,
            })
        }
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

    updateMap = () => {
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

                if( m.mbmarker && m.el ) {
                    m.mbmarker.setLngLat( coord )
console.log( 'LANCE updateMap setLngLat id, coord, m.mbmarker, m', id, coord, m.mbmarker, m )
                } else if( m.el ) {
                    // m.mbmarker = new mapboxgl.Marker( m.el )
                    m.mbmarker = new mapboxgl.Marker( m.el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
                    m.mbmarker.setLngLat( coord ).addTo( map )
console.log( 'LANCE updateMap newMarker id, coord, m.mbmarker, m', id, coord, m.mbmarker, m )
                } else {
console.log( 'LANCE updateMap no el id, coord, m', id, coord, m )
                }

                return null
            })

            Object.keys( paths ).map( k => paths[ k ] ).map( p => {
                const { id, originCoords, destinationCoords, selected } = p
                const highlighted = oneHasSomeOther( p.aircraftIds, selectedAircraftIds )
                // const coordinates = originCoords && destinationCoords && [ originCoords, destinationCoords ]
                const coordinates = [ originCoords, destinationCoords ]

                const source = `path${id}`
                const layer = `path${id}`

                this._sources = this._sources.concat( source )
                this._layers = this._layers.concat( layer )

console.log( 'LANCE line source, coordinates', source, coordinates )
                // map.addSource( source, {
                //     'type': 'geojson',
                //     'data': {
                //         'type': 'Feature',
                //         'properties': {},
                //         'geometry': {
                //             'type': 'LineString',
                //             coordinates
                //         }
                //     }
                // })

                var route = {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': coordinates
                            }
                        }
                    ]
                }

                // // Calculate the distance in kilometers between route start/end point.
                // // const lineDistance = turf.length(route.features[0]);
                // // const lineDistance = length(route.features[0]);
                // // const lineDistance = turf.distance( originCoords, destinationCoords )
                // const lineDistance = turf.distance( route.features[0].geometry.coordinates[ 0 ], route.features[0].geometry.coordinates[ 1 ] )

                // const arc = [];
                 
                // // Number of steps to use in the arc and animation, more steps means
                // // a smoother arc and animation, but too many steps will result in a
                // // low frame rate
                // const steps = 500;
                 
                // // Draw an arc between the `origin` & `destination` of the two points
                // for ( let i = 0; i < lineDistance; i += lineDistance / steps ) {
                //     const segment = turf.along(route.features[0], i);
                //     // const segment = turf.along(route.features[0].geometry.coordinates, i);
                //     // const segment = along(route.features[0], i);
                //     arc.push(segment.geometry.coordinates);
                // }
                 
                // // Update the route with calculated arc coordinates
                // route.features[0].geometry.coordinates = arc;

                const originTurfPoint = new turf.point( originCoords )
                const destinationTurfPoint = new turf.point( destinationCoords )
                const greatCircle = turf.greatCircle( originTurfPoint, destinationTurfPoint )  // , {properties: {npoints: 123, name: '...'} } )

                // Update the route with calculated arc coordinates
                route.features[0].geometry.coordinates = greatCircle.geometry.coordinates

                map.addSource( source, {
                    'type': 'geojson',
                    'data': route
                });
 
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

    moveMarkers = () => {
        const { _map: map, _markers: markers } = this
        // const { selectedAircraftIds } = state
        // const { fleet, aircraftInfoSelector } = props
        // const { markers, paths, boundingBox, flyToCoord } = props
        // const { _markers: markers } = this
console.log( 'LANCE moveMarkers', markers )

        // if( map && map.loaded() && map.isStyleLoaded() ) { // ? todo - unloaded because of rerender?
            Object.keys( markers ).map( k => markers[ k ] ).map( m => {
                // const aircraftInfo = aircraftInfoSelector( f.id )
                // const points = aircraftInfo.points.filter( p => p.lat && p.lon )
                // const coordinates = points.map( p => [ p.lon, p.lat ] )
                const { id, coord } = m

                if( m.mbmarker && m.el ) {
                    m.mbmarker.setLngLat( coord )
console.log( 'LANCE moveMarkers setLngLat id, coord, m.mbmarker, m', id, coord, m.mbmarker, m )
                } else if( m.el ) {
                    // m.mbmarker = new mapboxgl.Marker( m.el )
                    m.mbmarker = new mapboxgl.Marker( m.el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
                    m.mbmarker.setLngLat( coord ).addTo( map )
console.log( 'LANCE moveMarkers newMarker id, coord, m.mbmarker, m', id, coord, m.mbmarker, m )
                } else {
                    // need render
console.log( 'LANCE moveMarkers no el id, coord, m', id, coord, m )
                }

                if( m.mbmarker ) {
                    m.mbmarker.setLngLat( coord )
                }

                return null
            })
        // }
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
        const { props, close, goMap, state } = this
        const { fleet: telemetryData } = state
        const { fleet } = props
        const aircraft = fleet[ id ]
        const aircraftTelemetry = telemetryData[ id ]
        const now = Date.now()
        const recentTelemetry = aircraftTelemetry && now - aircraftTelemetry.time < 60 * 1000
        // const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
console.log( 'LANCE renderSelectedAircraft id, fleet[ id ]', id, fleet[ id ] )
        if( aircraft ) {
            const aircraftWithTelemtry = {
                ...aircraft,
                ...aircraftTelemetry,
            }
            const { 
                name,
                baseId,
                flightId,
                originId,
                destinationId,
                charge,
                aircraftAltitude: altitude,
                aircraftSpeed: speed,
                atd,
                eta,
                bearing,
                distance,
                covered,
                elapsed,
            } = aircraftWithTelemtry
            const { originLat, originLon, destinationLat, destinationLon } = aircraft
            const { originCode, destinationCode } = aircraft
            if( destinationCode && recentTelemetry ) {
                // return renderFlyingSelectedAircraft( id, originPoint, destinationPoint )
                return <SuperviseFlyingAircraft 
                    key={ id } 
                    id={id} 
                    name={name} 
                    flightId={flightId}
                    originCode={originCode} 
                    destinationCode={destinationCode} 
                    charge={charge} 
                    altitude={altitude} 
                    speed={speed} 
                    atd={atd} 
                    eta={eta} 
                    bearing={bearing} 
                    speed={speed} 
                    altitude={altitude} 
                    distance={distance} 
                    covered={covered} 
                    elapsed={elapsed} 
                    close={ close } 
                    goMap={ goMap } 
                />
            } else if( recentTelemetry ) {
                // return renderFlyingSelectedAircraft( id, originPoint, destinationPoint )
                return <SuperviseFlyingAircraft 
                    key={ id } 
                    id={id} 
                    name={name} 
                    flightId={flightId}
                    charge={charge} 
                    altitude={altitude} 
                    speed={speed} 
                    atd={atd} 
                    eta={eta} 
                    bearing={bearing} 
                    speed={speed} 
                    altitude={altitude} 
                    distance={distance} 
                    covered={covered} 
                    elapsed={elapsed} 
                    close={ close } 
                    goMap={ goMap } 
                />
            } else {
                // return renderParkedSelectedAircraft( id, originPoint )
                return <SuperviseParkedAircraft key={ id } id={id} originCode={originCode} close={ close } fleet={ fleet }/>
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
    const { fleet } = state
    const { location: { search } } = props
    const selectedAircraftIds = ( new URLSearchParams( search ).getAll( 'a' ) || [] ).map( said => +said )
    console.log( 'LANCE selectedAircraftIds', selectedAircraftIds )

    const markers = getMarkers( fleet )
    const paths = getPaths( fleet )
    let flyToCoord

    if( selectedAircraftIds && selectedAircraftIds.length > 0 ) {
        const marker = getMarker( selectedAircraftIds[ 0 ], fleet, {} )
        if( marker ) {
            flyToCoord = marker.coord
        }
    }

    let boundingBox
    const coords = Object.keys( markers ).map( k => markers[ k ].coord ).concat(
        Object.keys( paths ).map( k => paths[ k ].originCoords ) ).concat(
        Object.keys( paths ).map( k => paths[ k ].destinationCoords ) )
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

console.log( 'mapStateToProps markers', markers )

    return {
        fleet,
        markers,
        paths,
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
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Supervise)
