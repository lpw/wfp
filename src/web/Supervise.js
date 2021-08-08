import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import {
    requestFleet,
} from '../actions'
import SuperviseFlyingAircraft from './SuperviseFlyingAircraft'
import SuperviseParkedAircraft from './SuperviseParkedAircraft'
import Marker from './Marker'
import './Supervise.css'

const oneHasSomeOther = ( one, other ) => one.some( id => other.includes( id ) )
const markerHasSelectedAircraft = ( marker, selectedAircraftIds ) => oneHasSomeOther( marker.aircraftIds, selectedAircraftIds )
const pathHasSelectedAircraft = ( path, selectedAircraftIds ) => oneHasSomeOther( path.aircraftIds, selectedAircraftIds )
const removeMarkersAircraft = ( marker, selectedAircraftIds ) => selectedAircraftIds.filter( id => !marker.aircraftIds.includes( id ) )
const addMarkersAircraft = ( marker, selectedAircraftIds ) => selectedAircraftIds.concat( marker.aircraftIds )

const getMarker = ( aircraftId, fleet ) => {
    let marker
    const aircraft = fleet[ aircraftId ]
    if( aircraft ) {
        const { baseId, originId, lat, lon } = aircraft
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
                coord,
                name: aircraft.name,
            }
        }
    }

    return marker
}

const getMarkers = ( fleet ) => {
    const markers = Object.keys( fleet ).map( k => fleet[ k ]).reduce( ( msf, aircraft )=> {
        const colocatedMsf = Object.keys( msf ).map( k => msf[ k ] ).find( m => m.coord[1] === aircraft.lat && m.coord[0] === aircraft.lon )
        if( colocatedMsf ) {
            const { [ colocatedMsf.id ]: ignoreOldId, ...msfWithoutColo } = msf
            const id = `${colocatedMsf.id}_${aircraft.id}`
            const newName = `${colocatedMsf.name}, ${aircraft.name}`
            const newAircraftIds = colocatedMsf.aircraftIds.concat( aircraft.id )
            msf = {
                ...msfWithoutColo,
                [ id ]: {
                    ...colocatedMsf, // id, pointId...
                    id,
                    name: newName,
                    aircraftIds: newAircraftIds
                }
            }
        } else if( aircraft.lat && aircraft.lon ) {
            const coord = [ aircraft.lon, aircraft.lat ]
            const id = aircraft.id  // unique key for Marker identity
            assert( id )
            msf = {
                ...msf,
                [ id ]: {
                    id,
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

const getPaths = ( fleet ) => {
    const paths = Object.keys( fleet ).map( k => fleet[ k ]).reduce( ( psf, aircraft )=> {
        const { originLat, originLon, destinationLat, destinationLon } = aircraft
        if( typeof destinationLat === 'number' && typeof destinationLon === 'number' ) {
            const originCoords = [ originLon, originLat ]
            const destinationCoords = [ destinationLon, destinationLat ]
            // id incorpoates coords so it's accurate reflection of lat/lon and changes
            const id = `${originCoords}-${destinationCoords}`
            const colocatedPsf = psf[ id ]
            if( colocatedPsf ) {
                psf = {
                    ...psf,
                    [ colocatedPsf.id ]: {
                        ...colocatedPsf, // id, pointId...
                        aircraftIds: colocatedPsf.aircraftIds.concat( aircraft.id ),
                    }
                }
            } else {
                psf = {
                    ...psf,
                    [ id ]: {
                        id,
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

        this._sources = {}
        this._layers = {}

        this.state = {
            selectedAircraftIds,
            fleet: {}
        }

        this._initialMapRendered = false
    }

    setRef = ( el, marker ) => {
        marker.el = el
    }

    componentDidMount() {
        const { props, updateAircraft } = this
        const {
            markers,
            requestFleet,
        } = props

        if( markers.length <= 0 ) {
            requestFleet()
        }

        this.setupMap()
    }

    clickMarker = markerId => {
        const { state, props } = this
        const { markers } = props
        const { selectedAircraftIds } = state
        const marker = markers[ markerId ]
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

        this.setState({
            selectedAircraftIds: selectedAircraftIds.filter( said => said !== id )
        })
    }

    goMap = id => {
        const { props } = this
        const { fleet } = props
        const aircraft = fleet[ id ]

        if( aircraft ) {
            this._map.flyTo({
                center: [ aircraft.lon, aircraft.lat ],
                zoom: 12  // 22, 15, 10, ...
            })
        }
    }   

    setupMap() {
        const { _mapRef } = this
        if( _mapRef.current ) {
            this._map = new mapboxgl.Map({
                container: _mapRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-122.486052, 37.830348],
                zoom: 15  // 22, 15, ...
            });
            this._map.on( 'load', () => this.updateMap() )
        }
    }

    updateMap = () => {
        const { _map: map, props, state } = this
        const { selectedAircraftIds } = state
        const { markers, paths, boundingBox, flyToCoord } = props

        if( map && map.loaded() && map.isStyleLoaded() ) {
            Object.keys( this._layers ).map( k => this._layers[ k ] ).map( l => l.hasPath = false )
            Object.keys( this._sources ).map( k => this._sources[ k ] ).map( s => s.hasPath = false )

            Object.keys( paths ).map( k => paths[ k ] ).map( p => {
                const { id, originCoords, destinationCoords, selected } = p
                const highlighted = oneHasSomeOther( p.aircraftIds, selectedAircraftIds )
                const coordinates = [ originCoords, destinationCoords ]
                const sourceName = `path${id}`
                const layerName = `path${id}`

                const highlightChange = this._sources[ sourceName ] && this._layers[ layerName ] && ( this._sources[ sourceName ].highlighted !== highlighted || this._layers[ layerName ].highlighted !== highlighted )
                if( highlightChange ) {
                    map.removeLayer( layerName )
                    map.removeSource( sourceName )
                    delete this._layers[ layerName ]
                    delete this._sources[ sourceName ]
                }

                const rendered = this._sources[ sourceName ] && this._layers[ layerName ] && this._sources[ sourceName ].rendered && this._layers[ layerName ].rendered

                if( rendered ) {
                } else {
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

                    const originTurfPoint = new turf.point( originCoords )
                    const destinationTurfPoint = new turf.point( destinationCoords )
                    const greatCircle = turf.greatCircle( originTurfPoint, destinationTurfPoint )  // , {properties: {npoints: 123, name: '...'} } )

                    route.features[0].geometry.coordinates = greatCircle.geometry.coordinates

                    map.addSource( sourceName, {
                        'type': 'geojson',
                        'data': route
                    });
     
                    map.addLayer({
                        'id': layerName,
                        'type': 'line',
                        'source': sourceName,
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': highlighted ? '#00F' : '#888',
                            'line-width': 8
                        }
                    })
                }

                this._sources[ sourceName ] = {
                    ...this._sources[ sourceName ],  // retains rendered
                    name: sourceName,
                    hasPath: true,
                    rendered: true,
                    highlighted,
                }
                this._layers[ layerName ] = {
                    ...this._layers[ layerName ],  // retains rendered
                    name: layerName,
                    hasPath: true,
                    rendered: true,
                    highlighted,
                }

                return null
            })

            // remove unrendered sources and layers (layerrs first to avoid reference dependency)
            this._layers = Object.keys( this._layers ).map( k => this._layers[ k ] ).filter( l => {
                if( !l.hasPath && l.rendered ) {
                    console.log( `LANCE updateMap removing layer ${l.name}` )
                    map.removeLayer( l.name )
                    return false
                } else {
                    return true
                }
            }).reduce( ( a, l ) => {
                return {
                    ...a,
                    [ l.name ]: {
                        ...a[ l.name ],
                        ...l,
                    }
                }
            }, {} )

            this._sources = Object.keys( this._sources ).map( k => this._sources[ k ] ).filter( s => {
                if( !s.hasPath && s.rendered ) {
                    console.log( `LANCE updateMap removing source ${s.name}` )
                    map.removeSource( s.name )
                    return false
                } else {
                    return true
                }
            }).reduce( ( a, s ) => {
                return {
                    ...a,
                    [ s.name ]: {
                        ...a[ s.name ],
                        ...s,
                    }
                }
            }, {} )

            if( !this._initialMapRendered ) {
                if( flyToCoord && !this._initialMapRendered ) {
                    map.flyTo({
                        center: flyToCoord
                    })
                } else if( boundingBox ) {
                    map.fitBounds( boundingBox )
                }
            this._initialMapRendered = true
            }
        }
    }

    renderMarker = m => {
        const { setRef, clickMarker, state, _map: map } = this
        const { selectedAircraftIds } = state
        const { id, aircraftIds } = m
        const aircraftId = aircraftIds[ 0 ]
        const markerAndNamesSelected = markerHasSelectedAircraft( m, selectedAircraftIds )
        if( id && aircraftId && m.name && map ) {
            return (
                <Marker key={ id } id={ id } aircraftId={ aircraftId } name={ m.name } selected={ markerAndNamesSelected } map={ map } clickMarker={ clickMarker }/>
            )
        } else {
            assert( id )
            assert( aircraftId )
            assert( m.name )
            // assert( map )
            return (
                null
            )
        }
    }

    renderSelectedAircraft = id => {
        const { props, close, goMap, state } = this
        const { fleet } = props
        const aircraft = fleet[ id ]
        if( aircraft ) {
            const now = Date.now()
            const { 
                name,
                baseId,
                flightId,
                originId,
                destinationId,
                charge,
                altitude,
                speed,
                etd,
                eta,
                atd,
                ata,
                heading,
                distance,
                covered,
                elapsed,
            } = aircraft
            const { originLat, originLon, destinationLat, destinationLon } = aircraft
            const { baseCode, originCode, destinationCode } = aircraft
            if( ( destinationCode && !ata ) ) { // || recentTelemetry ) {
                if( !etd ) {
                    console.warn( 'Supervise::renderSelectedAircraft surprised not to have an etd' )
                }
                if( !atd ) {
                    console.warn( 'Supervise::renderSelectedAircraft surprised not to have an atd' )
                }
                if( !eta ) {
                    console.warn( 'Supervise::renderSelectedAircraft surprised not to have an eta' )
                }
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
                    heading={heading} 
                    speed={speed} 
                    altitude={altitude} 
                    distance={distance} 
                    covered={covered} 
                    elapsed={elapsed} 
                    close={ close } 
                    goMap={ goMap } 
                />
            } else {
                return <SuperviseParkedAircraft key={ id } id={id} locationCode={destinationCode || originCode || baseCode} close={ close } fleet={ fleet }/>
            }
        }
    }

    render() {
        const { updateMap, props, state, renderMarker, renderSelectedAircraft } = this
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
