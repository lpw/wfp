import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
// import turf from 'turf'
// import * as turf from '@turf/turf'
import socketIOClient from "socket.io-client"
import {
    requestFleet,
    // requestPoints,
} from '../actions'
import {
    aircraftDataFromId,
} from '../selectors'
import './Marker.css'

class Marker extends Component {
    constructor(props) {
        super( props )

        // this._markerRef = React.createRef()

        // this.state = {
        //     selectedAircraftIds,
        //     fleet: {}
        // }

        // this._markers = props.markers

        // this._previousAnimationTimestamp = 0
        this._previousCallTimestamp = 0
    }

    // componentDidMount() {
    //     const { props, updateAircraft, _markers: markers } = this
    //     const {
    //         // markers,
    //         // points,
    //         requestFleet,
    //         // requestPoints,
    //     } = props
    // }

    clickMarker = () => {
        console.log( 'LANCE clickMarker marker' )
        const { props } = this
        const { id, clickMarker } = props
        clickMarker( id )
    }

    // can't figure out how to tell this when to move direct vs animate (goMap vs socket data)
    // moveNoAnimation = () => {
    //     const { _el: el, _mbMarker: mbMarker, props, _animationFrame: animationFrame } = this
    //     const { aircraftData } = props
    //     const { lat, lon } = aircraftData
    //     const coords = [ lon, lat ]

    //     cancelAnimationFrame( animationFrame )
    //     this._animationFrame = null

    //     if( typeof lat === 'number' && typeof lon === 'number' ) {
    //         if( mbMarker && el ) {
    //             mbMarker.setLngLat( coords )
    //         }
    //     }
    // }

    moveNA = () => {
        // const { _elRef: { current: el }, _mbMarker: mbMarker, props } = this
        const { _el: el, _mbMarker: mbMarker, props } = this
        const { id, map, aircraftData } = props
        const { lat, lon } = aircraftData
        const coords = [ lon, lat ]
id === -1 && console.log( 'LANCE Marker::move', id, coords, mbMarker )

        assert( this._mbMarker )

        if( typeof lat === 'number' && typeof lon === 'number' ) {
            if( mbMarker && el ) {
id === -1 && console.log( 'LANCE Marker::move has setLngLat coords', coords )

                mbMarker.setLngLat( coords )

            } else if( el ) {
                // m.mbmarker = new mapboxgl.Marker( m.el )
                const mbNewMarker = new mapboxgl.Marker( el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
                mbNewMarker.setLngLat( coords ).addTo( map )
                this._mbMarker = mbNewMarker
id === -1 && console.log( 'LANCE Marker::move new setLngLat coords', coords )
            } else {
                // need render
id === -1 && console.log( 'LANCE Marker::move no el coords',  coords )
            }
        } else {
            // need render
id === -1 && console.log( 'LANCE Marker::move no lat lon', lat, lon )
        }
    }

    move = () => {
        // const { _elRef: { current: el }, _mbMarker: mbMarker, props } = this
        const { _el: el, _mbMarker: mbMarker, props } = this
        const { id, map, aircraftData } = props
        const { lat, lon } = aircraftData
        const coords = [ lon, lat ]
id === 0 && console.log( 'LANCE Marker::move', id, coords, mbMarker )

        if( typeof lat === 'number' && typeof lon === 'number' ) {
            if( mbMarker && el ) {
id === -1 && console.log( 'LANCE Marker::move has setLngLat coords', coords )

                // mbMarker.setLngLat( coords )

                // function animateMarker(timestamp) {
                //     var radius = 20;
                     
                //     /* 
                //     Update the data to a new position 
                //     based on the animation timestamp. 
                //     The divisor in the expression `timestamp / 1000` 
                //     controls the animation speed.
                //     */
                //     marker.setLngLat([
                //     Math.cos(timestamp / 1000) * radius,
                //     Math.sin(timestamp / 1000) * radius
                //     ]);
                     
                //     /* 
                //     Ensure the marker is added to the map. 
                //     This is safe to call if it's already added.
                //     */
                //     marker.addTo(map);
                     
                //     // Request the next frame of the animation.
                //     requestAnimationFrame(animateMarker);
                // }

                cancelAnimationFrame( this._animationFrame )

                const expectedInterval = 10 * 1000
                const now = Date.now()
                const previousInterval = now - this._previousCallTimestamp
                this._previousCallTimestamp = now
id === -1 && console.log( 'LANCE Marker::move previousInterval', previousInterval )
id === -1 && console.log( 'LANCE Marker::move expectedInterval', expectedInterval )
                let previousAnimationTimestamp
                let start

                const curCoords = mbMarker.getLngLat()

                const curLon = curCoords.lng
                const curLat = curCoords.lat

                const newLon = coords[ 0 ]
                const newLat = coords[ 1 ]

                const difLon = newLon - curLon
                const difLat = newLat - curLat

id === -1 && console.log( 'LANCE Marker::move curLon', curLon )
id === -1 && console.log( 'LANCE Marker::move curLat', curLat )
id === -1 && console.log( 'LANCE Marker::move newLon', newLon )
id === -1 && console.log( 'LANCE Marker::move newLat', newLat )
id === -1 && console.log( 'LANCE Marker::move difLon', difLon )
id === -1 && console.log( 'LANCE Marker::move difLat', difLat )

                const step = ( timestamp ) => {
                    if( start === undefined ) {
                        start = timestamp
                    }

                    const elapsed = timestamp - start
id === -1 && console.log( 'LANCE Marker::move previousAnimationTimestamp', previousAnimationTimestamp )
id === -1 && console.log( 'LANCE Marker::move timestamp', timestamp )
id === -1 && console.log( 'LANCE Marker::move elapsed', elapsed )

                    if ( previousAnimationTimestamp !== timestamp ) {
                        // Math.min() is used here to make sure the element stops at exactly 200px
                        // const count = Math.min( 0.1 * elapsed, 200 )
                        // element.style.transform = 'translateX(' + count + 'px)';
                        const fraction = Math.max( Math.min( elapsed / expectedInterval, 1 ), 0 )

                        const incLon = curLon + difLon * fraction
                        const incLat = curLat + difLat * fraction
                        const incCoords = [ incLon, incLat ]

id === -1 && console.log( 'LANCE Marker::move fraction', fraction )
id === -1 && console.log( 'LANCE Marker::move incLon', incLon )
id === -1 && console.log( 'LANCE Marker::move incLat', incLat )
                        mbMarker.setLngLat( incCoords )
                    }

                    if( elapsed < expectedInterval ) { // Stop the animation after 2 seconds
                        previousAnimationTimestamp = timestamp
                        this._animationFrame = window.requestAnimationFrame( step )
                    } else {
                        mbMarker.setLngLat( coords )
                    }
                }
                     
                requestAnimationFrame( step )

            } else if( el ) {
                assert( 0 )
                // m.mbmarker = new mapboxgl.Marker( m.el )
                const mbNewMarker = new mapboxgl.Marker( el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
                mbNewMarker.setLngLat( coords ).addTo( map )
                this._mbMarker = mbNewMarker
id === 0 && console.log( 'LANCE Marker::move new setLngLat coords', coords )
            } else {
                // need render
id === -1 && console.log( 'LANCE Marker::move no el coords',  coords )
            }
        } else {
            // need render
id === -1 && console.log( 'LANCE Marker::move no lat lon', lat, lon )
        }
    }

    setRef = ( el ) => {
        // ? Uncaught DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
        const { move, props } = this
        const { id } = props
        console.log( 'LANCE setRef id el', id, el )
        this._el = el
        // move()
    }

    componentDidMount() {
        const { _el: el, _mbMarker: mbMarker, props } = this
        const { id, map, aircraftData } = props
        const { lat, lon } = aircraftData
        const coords = [ lon, lat ]

        assert( this._el )  // refs happen before mount

        // m.mbmarker = new mapboxgl.Marker( m.el )
        const mbNewMarker = new mapboxgl.Marker( this._el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
        mbNewMarker.setLngLat( coords )

        // without timeout, on main thread, React gives remove node error
        setTimeout( () => {
            mbNewMarker.addTo( map )
        }, 100 )

        this._mbMarker = mbNewMarker

id === 0 && console.log( 'LANCE Marker::componentDidMmount new setLngLat coords', coords )
    }

    componentWillUnmount() {
        const { _el: el, _mbMarker: mbMarker, props } = this
        const { map } = props

        assert( mbMarker )  // refs happen before mount

        if( mbMarker ) {
            map.removeLayer( mbMarker )
        }
    }

    componentDidUpdate() {
        const { move, props } = this
        const { id } = props
        console.log( 'LANCE componentDidUpdate id el', id, this._el )
        move()
    }

    render = () => {
        const { setRef, clickMarker, props } = this
        const { selected, name, aircraftData, id } = props
        const { lat, lon  } = aircraftData
        const markerClassNames = classNames( 
            'markerAndNames', 
            // append to external/existing classesNames from lib like mapbox via React/classNames?
            'mapboxgl-marker',
            'mapboxgl-marker-anchor-top',
            { markerAndNamesSelected: selected } 
        )

console.log( 'LANCE Marker::render id name', id, name )

            // <Marker key={ m.id } className={ markerClassNames } ref={ el => setRef( el, m ) } onClick={ () => clickMarker( m ) }>
        return (
            <div className={ markerClassNames } ref={ setRef } onClick={ clickMarker }>
                <div className="marker"></div>
                <div className="markerNames">
                    { name }
                </div>
            </div>
        )
    }
}

const mapStateToProps = ( state, props ) => {
    const { airraftId } = props
    // const { telemetry: stateTelemetryAll } = state
    // const stateTelemetry = stateTelemetryAll[ id ]
    // const telemetry = { 
    //     ...propTelemetry,
    //     ...stateTelemetry,
    // }
    const aircraftData = aircraftDataFromId( state, airraftId )

console.log( 'Marker::mapStateToProps id aircraftData', airraftId, aircraftData )

    return {
        aircraftData,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        // requestFleet: () => {
        //     dispatch( requestFleet() )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Marker)
