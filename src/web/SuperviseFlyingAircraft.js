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
    MFleet,
    // landFlight,
    landAircraft,
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
        const { name } = props
        window.alert( `Communications Panel for ${name}` )
    }

    video = () => {
        const { props } = this
        const { name } = props
        window.alert( `Video Panel for ${name}` )
    }

    contingency = () => {
        // const now = Date.now() / 1000
        const { props } = this
        const { name, destinationCode, id, landAircraft } = props  // flightId
        const answer = window.confirm( `Contingency Panel for ${name}\n\nLand at ${destinationCode} immediately?` )
        if( answer ) {
            // landFlight( flightId, now )
            landAircraft( id )
        }
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

        const { 
            id,
            name,
            originCode,
            destinationCode,
            charge,
            altitude,
            speed,
            atd,
            eta,
            heading,
            distance,
            covered,
            elapsed,
            close,
            goMap, 
        } = props

        const { showSixPack } = state

        const distancePercentComplete = distance > 0 ? covered / distance : 0
        const totalTime = eta > 0 && atd > 0 ? eta - atd : 0
        const timePercentComplete = totalTime > 0 ? elapsed / totalTime : 0
        const distanceRemaining = distance - covered
        const timeRemaining = totalTime > 0 ? totalTime - elapsed : 0

        const chargeCapacity = 4 * 60 * 60  // from sim

        const chargeLossPerSecondPer100Kts = 1
        const chargeRemaining = speed > 0 ? charge * 100 / ( chargeLossPerSecondPer100Kts * speed ) : 0
        const chargeLevel = charge / chargeCapacity
        const notEnough = timeRemaining > chargeRemaining

        const selectedAircraftChargeClassNames = classNames( 'selectedAircraftCharge', { notEnough } )
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )

        // const sixPackSize = showSixPack ? 250 : 50
        const largeSixPackClassNames = classNames( 'largeSixPack', { showSixPack } )

        const chartStyle = {
          // width: "70%",
          width: "180px",
        }

        const etaDate = new Date( eta * 1000 )
        const etaHours = etaDate.getUTCHours()
        const etaMinutes = etaDate.getUTCMinutes()
        const etaString = `${('0' + etaHours).slice(-2)}:${('0' + etaMinutes).slice(-2)}Z`

        // assert( originCode && destinationCode )
console.log( 'LANCE SuperviseFlyingAircraft render originCode', originCode )
console.log( 'LANCE SuperviseFlyingAircraft render destinationCode', destinationCode )

        return (
            <div className={ selectedAircraftClassNames }>
                <div className="selectedNameAndPath">
                    <span className="selectedAircraftName">{ name }</span>
                    { originCode && destinationCode && <span>
                        <span className="selectedAircraftOrigin">{ originCode }</span>
                        <span className="selectedAircraftArrow">&#x2192;</span>
                        <span className="selectedAircraftDestination">{ destinationCode }</span>
                    </span> }
                    <span className="selectedAircraftAltitude">ETA: { etaString }</span>
                    <span className="selectedAircraftAltitude">Altitude: { altitude } ft</span>
                    <span className="selectedAircraftSpeed">Speed: { speed } kts</span>
                    <button className="selectedMapButton" onClick={ () => goMap( id ) }>Map</button>
                    <button className="selectedCommsButton" onClick={ comms }>Comms</button>
                    <button className="selectedVideoButton" onClick={ video }>Video</button>
                    <button className="selectedContingencyButton" onClick={ contingency }>Contingency</button>
                    <button className="selectedCloseButton" onClick={ () => close( id ) }>X</button>
                </div>
                <div className="selectedAircraftRest">
                    <div className="selectedAircraftLeftCol">
                        { !( distance > 0 ) ? null : <div className="selectedDistanceBar">
                            <span className="selectedAircraftDistance">Distance Total: { Math.round( Math.max( distance, 0 ) ) } nm</span>
                            <span className="selectedAircraftDistance">Covered: { Math.round( Math.max( Math.min( covered, distance ), 0 ) ) } nm</span>
                            <ProgressBar bgColor={'#0000FF'} className="ProgressBar" completed={ Math.round( Math.max( Math.min( distancePercentComplete * 100, 100 ), 0 ) ) } />
                            <span className="selectedAircraftDistance">Remaning: { Math.round( Math.max( Math.min( distanceRemaining, distance ), 0 ) ) } nm</span>
                        </div> }
                        { !( totalTime > 0 ) ? null : <div className="selectedTimeBar">
                            <span className="selectedAircraftTime">Time Total: { Math.round( Math.max( totalTime / 60, 0 ) ) } min</span>
                            <span className="selectedAircraftTime">Elapsed: { Math.round( Math.max( Math.min( elapsed / 60, totalTime ), 0 ) ) } min</span>
                            <ProgressBar bgColor={'#0000FF'} className="ProgressBar" completed={ Math.round( Math.max( Math.min( timePercentComplete * 100, 100 ), 0 ) ) } />
                            <span className="selectedAircraftTime">Remaning: { Math.round( Math.max( Math.min( timeRemaining / 60 , totalTime / 60 ), 0 ) ) } min</span>
                        </div> }
                    </div>
                    <div className="selectedAircraftMiddleCol" >
                        <GaugeChart textColor="black" colors={['#FF0000', '#FFFF00', '#00FF00']} percent={ Math.round( Math.max( Math.min( chargeLevel, 1 ), 0 ) * 100 ) / 100 } className="selectedAircraftFuel" style={chartStyle} />
                        <span className={ selectedAircraftChargeClassNames }>Remaning: { Math.round( Math.max( chargeRemaining / 60, 0 ) ) } min</span>
                    </div>
                    <div onClick={ toggleSixPack }>
                        <SixPack size={ 50 } heading={ heading } speed={ speed } altitude={ altitude }/>
                    </div>
                </div>
                <div className={ largeSixPackClassNames }>
                    <SixPack size={ 250 } heading={ heading } speed={ speed } altitude={ altitude }/>
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
        // landFlight: ( flightId, ata ) => {
        //     dispatch( landFlight( flightId, ata ) )
        // },
        landAircraft: ( aircraftId ) => {
            dispatch( landAircraft( aircraftId ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SuperviseFlyingAircraft)
