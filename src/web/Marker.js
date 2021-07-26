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
    aircraftDataFromId,
} from '../selectors'
import './Marker.css'

class Marker extends Component {
    // constructor(props) {
    //     super( props )

    //     this._markerRef = React.createRef()

    //     // this.state = {
    //     //     selectedAircraftIds,
    //     //     fleet: {}
    //     // }

    //     // this._markers = props.markers
    // }

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

    move = () => {
        // const { _elRef: { current: el }, _mbMarker: mbMarker, props } = this
        const { _el: el, _mbMarker: mbMarker, props } = this
        const { id, map, aircraftData } = props
        const { lat, lon } = aircraftData
        const coords = [ lon, lat ]
console.log( 'LANCE Marker::move', id, coords, mbMarker )

        if( typeof lat === 'number' && typeof lon === 'number' ) {
            if( mbMarker && el ) {
                mbMarker.setLngLat( coords )
console.log( 'LANCE Marker::move has setLngLat coords', coords )
            } else if( el ) {
                // m.mbmarker = new mapboxgl.Marker( m.el )
                const mbNewMarker = new mapboxgl.Marker( el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
                mbNewMarker.setLngLat( coords ).addTo( map )
                this._mbMarker = mbNewMarker
console.log( 'LANCE Marker::move new setLngLat coords', coords )
            } else {
                // need render
console.log( 'LANCE Marker::move no el coords',  coords )
            }
        } else {
            // need render
console.log( 'LANCE Marker::move no lat lon', lat, lon )
        }
    }

    setRef = ( el ) => {
        const { move, props } = this
        const { id } = props
        console.log( 'LANCE setRef id el', id, el )
        this._el = el
        move()
    }

    componentDidUpdate() {
        const { move, props } = this
        const { id } = props
        console.log( 'LANCE componentDidUpdate id el', id, this._el )
        move()
    }

    render = () => {
        const { setRef, clickMarker, props, move } = this
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
