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
import SixPack from './SixPack'

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
        const { props } = this
        const { id, fleet } = props
        const aircraft = fleet[ id ]
        const { name } = aircraft
        window.alert( `Communications Panel for ${name}` )
    }

    video = () => {
        const { props } = this
        const { id, fleet } = props
        const aircraft = fleet[ id ]
        const { name } = aircraft
        window.alert( `Video Panel for ${name}` )
    }

    contingency = () => {
        const { props } = this
        const { id, fleet } = props
        const aircraft = fleet[ id ]
        const { name } = aircraft
        window.alert( `Contingency Panel for ${name}` )
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
        // const sixPackSize = showSixPack ? 250 : 50
        const aircraft = fleet[ id ]
        const { name, altitude = 123, speed = 456, distance = 789, time = 987 } = aircraft
        const distancePercentComplete = 0.7
        const timePercentComplete = 0.6
        const distanceComplete = distance * distancePercentComplete
        const timeComplete = time * timePercentComplete
        const distanceRemaining = distance - distanceComplete
        const timeRemaining = time - timeComplete
        const wh = 95000
        const level = 0.8
        const whpm = 300
        const chargeMinutesRemaining = wh * level / whpm
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
        const notEnough = timeRemaining > chargeMinutesRemaining
        const selectedAircraftChargeClassNames = classNames( 'selectedAircraftCharge', { notEnough } )
        const largeSixPackClassNames = classNames( 'largeSixPack', { showSixPack } )
        const chartStyle = {
          // width: "70%",
          width: "180px",
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
                            <span className="selectedAircraftDistance">Complete: { Math.round( distanceComplete ) } nm</span>
                            <ProgressBar bgColor={'#0000FF'} className="ProgressBar" completed={ distancePercentComplete * 100 } />
                            <span className="selectedAircraftDistance">Remaning: { Math.round( distanceRemaining ) } nm</span>
                        </div>
                        <div className="selectedTimeBar">
                            <span className="selectedAircraftTime">Time Total: { time } min</span>
                            <span className="selectedAircraftTime">Complete: { Math.round( timeComplete ) } min</span>
                            <ProgressBar bgColor={'#0000FF'} className="ProgressBar" completed={ timePercentComplete * 100 } />
                            <span className="selectedAircraftTime">Remaning: { Math.round( timeRemaining ) } min</span>
                        </div>
                    </div>
                    <div className="selectedAircraftMiddleCol" >
                        <GaugeChart textColor="black" colors={['#FF0000', '#FFFF00', '#00FF00']} percent={ level } className="selectedAircraftFuel" style={chartStyle} />
                        <span className={ selectedAircraftChargeClassNames }>Remaning: { Math.round( chargeMinutesRemaining ) } min</span>
                    </div>
                    <div onClick={ toggleSixPack }>
                        <SixPack size={ 50 } />
                    </div>
                </div>
                <div className={ largeSixPackClassNames }>
                    <SixPack size={ 250 } />
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
