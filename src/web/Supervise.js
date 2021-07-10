import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
import ProgressBar from "@ramonak/react-progress-bar"
import {
  Airspeed,
  Altimeter,
  AttitudeIndicator,
  HeadingIndicator,
  TurnCoordinator,
  Variometer
} from 'react-flight-indicators'
import {
    requestFleet,
    requestPoints,
    // requestSupervise,
    // deleteSupervise,
    // deleteRoute,
} from '../actions'
import {
    // pointsFromAircraftId,
    // altitudeFromAircraftId,
    // speedFromAircraftId,
} from '../selectors'
// import AddRoute from './AddRoute'
import './Supervise.css'

const stale = () => true // TBD what determines when to refetch stages and status of supervise  - always for now

const markerHasSelectedAircraft = ( marker, selectedAircraftIds ) => marker.aircraftIds.some( id => selectedAircraftIds.includes( id ) )
const removeMarkersAircraft = ( marker, selectedAircraftIds ) => selectedAircraftIds.filter( id => !marker.aircraftIds.includes( id ) )
const addMarkersAircraft = ( marker, selectedAircraftIds ) => selectedAircraftIds.concat( marker.aircraftIds )

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
                const id = Object.keys( psf ).length
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
                        // name: f.name,
                        // aircraftIds: [ f.id ],
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
            selectedAircraftIds
        }
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

    comms = () => {
        window.alert( 'Communications Panel' )
    }

    contingency = () => {
        window.alert( 'Contingency Panel' )
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
            this._map.on( 'load', () => this.loadMap() )
            // this._marker = fleet.map( f => new mapboxgl.Marker( this._markerRef[ f.name ].current ) ).reduce( ( a, m ) => ({ [ ]}))
        }
    }

    loadMap() {
        // this._map.loadImage(
        //     // '/static/wisk-icon.png',
        //     'https://docs.mapbox.com/mapbox-gl-js/assets/cat.png',
        //     ( error, image ) => {
        //         if (error) {
        //             console.warn( error )
        //             throw error
        //         } else if( image ) {
        //             this._map.addImage( 'custom-marker', image )
        //             setTimeout( () => this.updateMap(), 2000 )
        //         }
        //     }
        // )
        this.updateMap()
    }

    // deleteSupervise = () => {
    //     const { props } = this
    //     const { id, deleteSupervise } = props
    //     deleteSupervise( id )
    // }

    // deleteRoute = () => {
    //     const { props, state } = this
    //     const { deleteRoute, routeIds, id } = props
    //     const { routeIndex } = state
    //     const routeId = routeIds[ routeIndex ]
    //     deleteSupervise( id, routeId )
    // }

    // previous = () => {
    //     const { props, state } = this
    //     const { routeIds } = props
    //     const numRoutes = routeIds.length
    //     const { routeIndex } = state
    //     this.setState( { routeIndex: ( numRoutes + ( routeIndex - 1 ) % numRoutes ) % numRoutes } )
    // }

    // next = () => {
    //     const { props, state } = this
    //     const { routeIds } = props
    //     const numRoutes = routeIds.length
    //     const { routeIndex } = state
    //     this.setState( { routeIndex: ( routeIndex + 1 ) % numRoutes } )
    // }

    updateMap = routes => {
        // const { _map: map, props, state } = this
        const { _map: map, props } = this
        // const { routeIndex } = state
        // const { fleet, aircraftInfoSelector } = props
        const { markers, paths, boundingBox } = props
        // let flyToPoint
console.log( 'LANCE markers', markers )
console.log( 'LANCE paths', paths )

        if( map && map.loaded() && map.isStyleLoaded() ) {
            this._layers.map( layer => map.removeLayer( layer ) )
            this._sources.map( source => map.removeSource( source ) )
            this._layers = []
            this._sources = []

//             markers.map( f => {
//                 const aircraftInfo = aircraftInfoSelector( f.id )
//                 const points = aircraftInfo.points.filter( p => p.lat && p.lon )
//                 const coordinates = points.map( p => [ p.lon, p.lat ] )

//                 if( points && points.length > 0 ) {
//                     const source = `aircraft${f.id}`
//                     const layer = `aircraft${f.id}`

//                     this._sources = this._sources.concat( source )
//                     this._layers = this._layers.concat( layer )

//                     assert( coordinates.length === points.length )
//                     assert( coordinates.length > 0 )

//                     if( points.length >= 2 ) {
// console.log( 'LANCE line', source, coordinates[0][0], coordinates[0][1], coordinates[1][0], coordinates[1][1] )
//                         map.addSource( source, {
//                             'type': 'geojson',
//                             'data': {
//                                 'type': 'Feature',
//                                 'properties': {},
//                                 'geometry': {
//                                     'type': 'LineString',
//                                     coordinates
//                                 }
//                             }
//                         })
//                         map.addLayer({
//                             'id': layer,
//                             'type': 'line',
//                             'source': source,
//                             'layout': {
//                                 'line-join': 'round',
//                                 'line-cap': 'round'
//                             },
//                             'paint': {
//                                 'line-color': '#888',
//                                 'line-width': 8
//                             }
//                         })
//                     } else if( points.length === 1 ) {
// console.log( 'LANCE point', source, coordinates[0][0], coordinates[0][1] )
//                         map.addSource( source, {
//                             'type': 'geojson',
//                             'data': {
//                                 'type': 'Feature',
//                                 // 'properties': {},
//                                 'geometry': {
//                                     'type': 'Point',
//                                     coordinates
//                                 }
//                             }
//                         })
//                         // map.addLayer({
//                         //     'id': layer,
//                         //     // 'type': 'symbol',
//                         //     // 'source': source,
//                         //     // // 'layout': {
//                         //     // // },
//                         //     // // 'paint': {
//                         //     // //     'line-color': '#888',
//                         //     // //     'line-width': 8
//                         //     // // },
//                         //     // // 'layout': {
//                         //     // //     'icon-image': 'custom-marker',
//                         //     // //     'icon-size': 10
//                         //     // //     // get the title name from the source's "title" property
//                         //     // //     // 'text-field': ['get', 'title'],
//                         //     // //     // 'text-font': [
//                         //     // //     //     'Open Sans Semibold',
//                         //     // //     //     'Arial Unicode MS Bold'
//                         //     // //     // ],
//                         //     // //     // 'text-offset': [0, 1.25],
//                         //     // //     // 'text-anchor': 'top'
//                         //     // // },
//                         //     // // 'layout': {
//                         //     // //     'icon-image': 'custom-marker',
//                         //     // // },
//                         // })
//                     }

//                     assert( this._markers[ f.name ] )
//                     assert( this._markers[ f.name ].el )
//                     if( !this._markers[ f.name ].marker ) {
//                         this._markers[ f.name ].marker = new mapboxgl.Marker( this._markers[ f.name ].el )
//                     }
// console.log( 'LANCE updateMap f.name, this._markers[ f.name ].marker', f.name, this._markers[ f.name ].marker )
//                     this._markers[ f.name ].marker.setLngLat( coordinates[ 0 ] ).addTo( map )

//                     if( !flyToPoint ) {
//                         flyToPoint = coordinates[ 0 ]
//                     }
//                 }

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

                // if( !flyToPoint ) {
                //     if( markerHasSelectedAircraft( m, selectedAircraftIds ) ) {
                //         flyToPoint = coord
                //     }
                // }

                return null
            })

            Object.keys( paths ).map( k => paths[ k ] ).map( p => {
                const { id, originCoord, destinationCoord } = p
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
                        'line-color': '#888',
                        'line-width': 8
                    }
                })

                return null
            })

// console.log( 'LANCE flyToPoint', flyToPoint, flyToPoint && flyToPoint[0], flyToPoint && flyToPoint[1] )
//             if( flyToPoint ) {
//                 map.flyTo({
//                     center: flyToPoint
//                 })
//                 // this._marker.setLngLat( flyToPoint ).addTo( map )
//             }
console.log( 'LANCE fitBounds boundingBox', boundingBox )
            if( boundingBox ) {
                map.fitBounds( boundingBox )
            }
        }
    }

    // renderRoute = () => {
    //     this.updateMap()

    //     // return (
    //     //     <React.Fragment>
    //     //         <div>{JSON.stringify( points )}</div>
    //     //     </React.Fragment>
    //     // )
    // }

    // componentWillReceiveProps( nextProps ) {
    //     const { routeIds = [] } = this.props
    //     const { routeIds: nextRouteIds = [] } = nextProps
    //     if ( routeIds.length !== nextRouteIds.length && nextRouteIds.length ) {
    //         this.setState( { routeIndex: nextRouteIds.length - 1 } )
    //         // this.updateMap()
    //     }
    // }

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
        const { props, renderFlyingSelectedAircraft, renderParkedSelectedAircraft } = this
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
                return renderFlyingSelectedAircraft( id, originPoint, destinationPoint )
            } else {
                return renderParkedSelectedAircraft( id, originPoint )
            }
        }
    }

    renderFlyingSelectedAircraft = ( id, originPoint, destinationPoint ) => {
        const { props, comms, contingency, close, sixPack } = this
        const { fleet } = props
        const aircraft = fleet[ id ]
        const { name, altitude = 123, speed = 456, distance = 789, time = 987 } = aircraft
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
        const distanceComplete = 0.7
        const timeComplete = 0.6
        assert( originPoint && destinationPoint )
console.log( 'LANCE renderFlyingSelectedAircraft originPoint', originPoint )
console.log( 'LANCE renderFlyingSelectedAircraft destinationPoint', destinationPoint )
                    // <div className="selectedTimeAndDistance">
                    //     <span className="selectedAircraftDistance">{ distance } nm</span>
                    //     <span className="selectedAircraftRemaining">{ distance * 2 } nm</span>
                    // </div>
                    // </div>
                    // <div className="selecteddAltAndSpeed">
        return (
            <div key={ id } className={ selectedAircraftClassNames }>
                <div className="selectedNameAndPath">
                    <span className="selectedAircraftName">{ name }</span>
                    <span>
                        <span className="selectedAircraftOrigin">{ originPoint.code }</span>
                        <span className="selectedAircraftArrow">&#x2192;</span>
                        <span className="selectedAircraftDestination">{ destinationPoint.code }</span>
                    </span>
                    <span className="selectedAircraftAltitude">Altitude: { altitude } ft</span>
                    <span className="selectedAircraftSpeed">Speed: { speed } kts</span>
                    <button className="selectedCommsButton" onClick={ comms }>Communicate</button>
                    <button className="selectedContingencyButton" onClick={ contingency }>Contingency</button>
                    <button className="selectedCloseButton" onClick={ () => close( id ) }>X</button>
                </div>
                <div className="selectedAircraftRest">
                    <div className="selectedAircraftLeftCol">
                        <div className="selectedDistanceBar">
                            <span className="selectedAircraftDistance">Distance Total: { distance } nm</span>
                            <span className="selectedAircraftDistance">Complete: { Math.round( distance * distanceComplete ) } nm</span>
                            <ProgressBar className="ProgressBar" completed={ distanceComplete * 100 } />
                            <span className="selectedAircraftDistance">Remaning: { Math.round( distance * ( 1 - distanceComplete ) ) } nm</span>
                        </div>
                        <div className="selectedTimeBar">
                            <span className="selectedAircraftTime">Time Total: { time } min</span>
                            <span className="selectedAircraftTime">Complete: { Math.round( time * timeComplete ) } min</span>
                            <ProgressBar className="ProgressBar" completed={ timeComplete * 100 } />
                            <span className="selectedAircraftTime">Remaning: { Math.round( time * ( 1 - timeComplete ) ) } min</span>
                        </div>
                    </div>
                    <div className="selectedAircraftRightCol" onClick={ sixPack }>
                        <div className="topRowSixPack">
                            <HeadingIndicator size={ 50 } className="oneOfSixPack" heading={Math.random() * 360} showBox={false} />
                            <Airspeed size={ 50 } className="oneOfSixPack" speed={Math.random() * 160} showBox={false} />
                            <Altimeter size={ 50 } className="oneOfSixPack" ltitude={Math.random() * 28000} showBox={false} />
                        </div>
                        <div className="bottomRowoneOfSixPack">
                            <AttitudeIndicator size={ 50 } className="oneOfSixPack" roll={(Math.random() - 0.5) * 120} pitch={(Math.random() - 0.5) * 40} showBox={false} />
                            <TurnCoordinator size={ 50 } className="oneOfSixPack" turn={(Math.random() - 0.5) * 120} showBox={false} />
                            <Variometer size={ 50 } className="oneOfSixPack" vario={(Math.random() - 0.5) * 4000} showBox={false} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderParkedSelectedAircraft = ( id, originPoint ) => {
        const { props } = this
        const { fleet } = props
        const aircraft = fleet[ id ]
        const { name } = aircraft
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
        assert( originPoint )
console.log( 'LANCE renderParkedSelectedAircraft originPoint', originPoint )
        return (
            <div key={ id } className={ selectedAircraftClassNames }>
                <span className="selectedAircraftName">{ name }</span>
                <span className="selectedAircraftOrigin">{ originPoint.code }</span>
            </div>
        )
    }

    render() {
        const { updateMap, props, state, renderMarker, renderSelectedAircraft } = this
        // const { routeIndex } = state
        const { markers } = props
        const { selectedAircraftIds } = state
        // const routeId = routeIds[ routeIndex ]
        // const numRoutes = routeIds.length
        // let path = 'none'
        // let altitude = 0
        // let speed = 0
        // // let routeIndexDisplay = -1
        // if( routeId ) {
        //     path = routePathFromRouteIdSelector( routeId )
        //     altitude = routeAltitudeFromRouteIdSelector( routeId )
        //     speed = routeSpeedFromRouteIdSelector( routeId )
        //     // routeIndexDisplay = routeIndex
        // }
                    // Route: <div className="supervise-path">{path}</div> ({ routeIndexDisplay + 1 } / { numRoutes })
                    // <button onClick={previous}>&lsaquo;</button>
                    // <button onClick={next}>&rsaquo;</button>
                    // <AddRoute id={id} />
                // <div className="supervise-header">
                //     Supervise : <b>{name}</b>
                //     Path: <div className="supervise-path">{path}</div> 
                //     Altitude: <div className="supervise-path">{altitude}</div> 
                //     Speed: <div className="supervise-path">{speed}</div> 
                // </div>
                // { userId === 1 && <button className="supervise-delete" onClick={deleteSupervise}>Delete this supervise </button> }

        // this._markers = fleet.map( f => ({
        //     name: f.name,
        //     // ref: new mapboxgl.Marker( this._markerRef[ f.name ].current )
        //     ref: React.createRef()
        // })).reduce( ( a, m ) => ({
        //     [ m.name ] : m.ref
        // }), {} )

                // { fleet.map( f => <div key={ f.name } className="marker" ref={ this._markers[ f.name ] && this._markers[ f.name ].ref ? this._markers[ f.name ].ref : ( this._markers[ f.name ] = { ref: React.createRef() } ) }>{ f.name }</div> ) }
                // { fleet.map( f => <div key={ f.name } className="marker" ref={ el => setRef( el, f.name ) }>{ groupedName( fleet, f.id ) }</div> ) }
                // { markers.map( m => <div key={ m.name } className="marker" ref={ el => setRef( el, m.name ) }>{ groupedName( fleet, f.id ) }</div> ) }
                // { markers.map( m => <div key={ m.id } className="marker" ref={ el => setRef( el, m.id ) }>{ m.name }</div> ) }
                // { Object.keys( markers ).map( k => markers[ k ] ).map( m => <div className="markerAndNames"><div key={ m.id } className="marker" ref={ el => setRef( el, m ) }>{ m.name }</div> ) }
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
    // const { match: { params } } = props
    // const { id } = params
    // const aircraftId = +id
    const { fleet, points } = state
    const { location: { search } } = props
    const selectedAircraftIds = ( new URLSearchParams( search ).getAll( 'a' ) || [] ).map( said => +said )
    console.log( 'LANCE selectedAircraftIds', selectedAircraftIds )

    // const name = nameFromAircraftId( state, aircraftId ) || aircraftId
    // const routeIds = routeIdsFromAircraftId( state, aircraftId )
    // const routeId = routeIds[ 0 ]
    // const routePathFromRouteIdSelector = id => routePathFromRouteId( state, id )
    // const routePointsFromRouteIdSelector = id => routePointsFromRouteId( state, id )
    // const routeAltitudeFromRouteIdSelector = id => routeAltitudeFromRouteId( state, id )
    // const routeSpeedFromRouteIdSelector = id => routeSpeedFromRouteId( state, id )
    // // const { userId: userIdKey } = state
    // // const userId = +userIdKey

    // const routeIdsSelector = id => routeIdsFromAircraftId( state, id )
    // const routePointsFromRouteIdSelector = id => routePointsFromRouteId( state, id )
    // const routeAltitudeFromRouteIdSelector = id => routeAltitudeFromRouteId( state, id )
    // const routeSpeedFromRouteIdSelector = id => routeSpeedFromRouteId( state, id )

    const markers = getMarkers( fleet, points )
    const paths = getPaths( fleet, points )


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

    // const aircraftInfoSelector = aircraftId => {
    //     // const routeIds = routeIdsFromAircraftId( state, aircraftId )
    //     // const routeId = routeIds[ 0 ]  // presume to use only the first route
    //     const points = pointsFromAircraftId( state, aircraftId )
    //     const altitude = altitudeFromAircraftId( state, aircraftId )
    //     const speed = speedFromAircraftId( state, aircraftId )
    //     return {
    //         points,
    //         altitude,
    //         speed,
    //     }
    // }
    // const getMarkerInfo = name => {
    //     const points = pointsFromAircraftId( state, aircraftId )
    //     return {
    //         points,
    //     }
    // }

    return {
        fleet,
        markers,
        paths,
        points,
        selectedAircraftIds,
        boundingBox,
        // getMarkerInfo,
        // routeIdsSelector
        // routePathFromRouteIdSelector,
        // routePointsFromRouteIdSelector,
        // routeAltitudeFromRouteIdSelector,
        // routeSpeedFromRouteIdSelector,
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
        // deleteSupervise: id => {
        //     dispatch( deleteSupervise( id ) )
        // },
        // deleteRoute: ( fpid, rid ) => {
        //     dispatch( deleteRoute( fpid, rid ) )
        // }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Supervise)
