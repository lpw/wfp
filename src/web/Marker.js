import assert from 'assert'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { connect } from 'react-redux'
import mapboxgl from 'mapbox-gl'
import './Marker.css'

function ease({
  startValue = 0,
  endValue = 1,
  durationMs = 200,
  onStep,
  onComplete = () => {},
}) {
  const raf = window.requestAnimationFrame || (func => window.setTimeout(func, 16));
  
  const stepCount = durationMs / 16;
  const valueIncrement = (endValue - startValue) / stepCount;
  const sinValueIncrement = Math.PI / stepCount;
  
  // let currentValue = startValue;
  let currentLinearValue = startValue;
  let currentSinValue = 0;
  
  function step() {
    currentSinValue += sinValueIncrement;
    // currentValue += valueIncrement * (Math.sin(currentSinValue) ** 2) * 2;
    currentLinearValue += valueIncrement 

    if (currentSinValue < Math.PI) {
      // onStep(currentValue);
      onStep( currentLinearValue )
      raf(step);
    } else {
      onStep(endValue);
      onComplete();
    }
  }

  return raf(step);
}

class Marker extends Component {
    constructor(props) {
        super( props )

        this.state = {
            mapLoaded: false,
        }

        this._previousCallTimestamp = 0

        this._elContainer = document.createElement( 'div' )
        this._elPortal = document.createElement( 'div' )
    }

    componentDidMount() {
        const { move, _elContainer: elContainer, _elPortal: elPortal } = this
        elContainer.appendChild( elPortal )
        move()
    }

    clickMarker = () => {
        const { props } = this
        const { id, clickMarker } = props
        clickMarker( id )
    }

    checkMap = () => {
        const { props } = this
        const { map } = props
        if( map && map.loaded() && map.isStyleLoaded() ) {
            this.setState({
                mapLoaded: true
            })
        } else {
            clearTimeout( this._checkMapTimer )
            this._checkMapTimer = setTimeout( () => {
                this.checkMap()
            }, 1000 )
        }
    }

    move = () => {
        const now = Date.now()
        const { _elPortal: el, _mbMarker: mbMarker, props, _previousCallTimestamp: previousCallTimestamp } = this
        const { map, aircraftData } = props
        const { lat, lon } = aircraftData
        const coords = [ lon, lat ]

        if( typeof lat !== 'number' || typeof lon !== 'number' ) {
        } else if( !map || !map.loaded()|| !map.isStyleLoaded() ) {
            clearTimeout( this._checkMapTimer )
            this._checkMapTimer = setTimeout( () => {
                this.checkMap()
            }, 1000 )
        } else if( !el ) {
            assert( el )  // shouldn't happen
        } else if( !mbMarker ) {
            assert( !mbMarker && el )

            const mbNewMarker = new mapboxgl.Marker( el, { anchor: 'top', offset: [ 0, -32 ] } ) // half of css height
            mbNewMarker.setLngLat( coords )

            this._mbMarkerLayer = mbNewMarker.addTo( map )

            this._mbMarker = mbNewMarker
        } else {
            assert( mbMarker && el )

            // animation frame or timer/timeout?
            cancelAnimationFrame( this._animationFrame )

            const expectedInterval = previousCallTimestamp ? ( now - previousCallTimestamp ) : 1000
            this._previousCallTimestamp = now

            const curCoords = mbMarker.getLngLat()

            const curLon = curCoords.lng
            const curLat = curCoords.lat

            const newLon = coords[ 0 ]
            const newLat = coords[ 1 ]

            const difLon = newLon - curLon
            const difLat = newLat - curLat

            this._animationFrame = ease({
                startValue: 0,
                endValue: 1,
                durationMs: expectedInterval,
                onStep: fraction => {
                    const incLon = curLon + difLon * fraction
                    const incLat = curLat + difLat * fraction
                    const incCoords = [ incLon, incLat ]

                    mbMarker.setLngLat( incCoords )
                }
            })
        }
    }

    // TODO: remove, don't need ref here
    setRef = () => {
    }

    componentDidUpdate() {
        const { move } = this
        move()
    }

    // TODO
    componentWillUnmount() {
        const { _mbMarkerLayer: mbMarkerLayer } = this

        if( mbMarkerLayer ) {
            // if( map.getLayer( mbMarkerLayer ) ) {
            //     map.removeLayer( mbMarkerLayer )
            // }
        } else {
            console.warn( 'Marker::componentWillUnmount no mbMarkerLayer' )
        }
    }

    render = () => {
        const { clickMarker, props } = this
        const { selected, name } = props
        const markerClassNames = classNames( 
            'markerAndNames', 
            { markerAndNamesSelected: selected } 
        )

        return (
            ReactDOM.createPortal(
                <div className={ markerClassNames } ref={ this.setRef } onClick={ clickMarker }>
                    <div className="marker"></div>
                    <div className="markerNames">
                        { name }
                    </div>
                </div>,
                this._elPortal,
            )
        )
    }
}

const mapStateToProps = ( state, props ) => {
    const { aircraftId } = props
    const { fleet } = state
    const aircraftData = fleet[ aircraftId ]

    assert( aircraftData )

    return {
        aircraftData,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Marker)
