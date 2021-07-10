import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import ProgressBar from "@ramonak/react-progress-bar"
import GaugeChart from 'react-gauge-chart'
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
} from '../actions'
import {
} from '../selectors'
import './SuperviseFlyingAircraft.css'

// const stale = () => true // TBD what determines when to refetch stages and status of supervise  - always for now

class SuperviseFlyingAircraft extends Component {
    constructor(props) {
        super( props )
        this.state = {
            showSixPack: false
        }
    }

    // componentDidMount() {
    //     const { props } = this
    //     const {
    //         fleet,
    //         requestFleet,
    //     } = props
    //     if( fleet.length <= 0 || stale() ) {
    //         requestFleet()
    //     }
    // }

    // setRef = ( el, marker ) => {
    //     console.log( 'LANCE setRef el', el )
    //     console.log( 'LANCE setRef marker.el', marker.el )
    //     console.log( 'LANCE setRef marker.el === el', marker.el === el )
    //     console.log( 'LANCE setRef marker', marker )
    //     marker.el = el
    // }

    comms = () => {
        window.alert( 'Communications Panel' )
    }

    video = () => {
        window.alert( 'Video Panel' )
    }

    contingency = () => {
        window.alert( 'Contingency Panel' )
    }

    toggleSixPack = () => {
        const { state } = this
        const { showSixPack } = state
        this.setState({
            showSixPack: !showSixPack
        })
    }
        
    render() {
        const { props, state, comms, video, contingency, toggleSixPack } = this
        const { id, originPoint, destinationPoint, fleet, close } = props
        const { showSixPack } = state
        const sixPackSize = showSixPack ? 250 : 50
        const aircraft = fleet[ id ]
        const { name, altitude = 123, speed = 456, distance = 789, time = 987 } = aircraft
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
        const distanceComplete = 0.7
        const timeComplete = 0.6
        const fuel = 0.8
        const chartStyle = {
          width: "70%",
        }
        assert( originPoint && destinationPoint )
console.log( 'LANCE SuperviseFlyingAircraft render originPoint', originPoint )
console.log( 'LANCE SuperviseFlyingAircraft render destinationPoint', destinationPoint )
        return (
            <div className={ selectedAircraftClassNames }>
                <div className="selectedNameAndPath">
                    <span className="selectedAircraftName">{ name }</span>
                    <span>
                        <span className="selectedAircraftOrigin">{ originPoint.code }</span>
                        <span className="selectedAircraftArrow">&#x2192;</span>
                        <span className="selectedAircraftDestination">{ destinationPoint.code }</span>
                    </span>
                    <span className="selectedAircraftAltitude">Altitude: { altitude } ft</span>
                    <span className="selectedAircraftSpeed">Speed: { speed } kts</span>
                    <button className="selectedCommsButton" onClick={ comms }>Comms</button>
                    <button className="selectedVideoButton" onClick={ video }>Video</button>
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
                    <div className="selectedAircraftMiddleCol" onClick={ toggleSixPack }>
                        <GaugeChart marginInPercent="0.00" colors={['#FF0000', '#FFFF00', '#00FF00']} percent={ fuel } className="selectedAircraftFuel" style={chartStyle} />
                    </div>
                    <div className="selectedAircraftRightCol" onClick={ toggleSixPack }>
                        <div className="topRowSixPack">
                            <HeadingIndicator size={ sixPackSize } className="oneOfSixPack" heading={Math.random() * 360} showBox={false} />
                            <Airspeed size={ sixPackSize } className="oneOfSixPack" speed={Math.random() * 160} showBox={false} />
                            <Altimeter size={ sixPackSize } className="oneOfSixPack" ltitude={Math.random() * 28000} showBox={false} />
                        </div>
                        <div className="bottomRowoneOfSixPack">
                            <AttitudeIndicator size={ sixPackSize } className="oneOfSixPack" roll={(Math.random() - 0.5) * 120} pitch={(Math.random() - 0.5) * 40} showBox={false} />
                            <TurnCoordinator size={ sixPackSize } className="oneOfSixPack" turn={(Math.random() - 0.5) * 120} showBox={false} />
                            <Variometer size={ sixPackSize } className="oneOfSixPack" vario={(Math.random() - 0.5) * 4000} showBox={false} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ( state, props ) => {
    // const { fleet } = state

    return {
        // fleet,
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
)(SuperviseFlyingAircraft)
