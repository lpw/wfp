import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { addFlight, requestPoints, requestFleet, flyAircraft } from '../actions'
import { setLocalStorage, getLocalStorage, getIdFromText } from '../utils'
import './AddFlight.css'

// const storedAircraft = getLocalStorage( 'aircraft' )

const stale = () => true // TBD what determines when to refetch flight  - always for now

class AddFlight extends Component {
	constructor(props) {
		super(props);

        const { mostRecentlyAddedFlight } = props

        // this.selectAircraftRef = React.createRef()
        // this.nameRef = React.createRef()
        this.destinationRef = React.createRef()
        this.altitudeRef = React.createRef()
        this.speedRef = React.createRef()
        this.chargeRef = React.createRef()

        this._mostRecentlyAddedFlight = mostRecentlyAddedFlight

        this.state = {
            addEnabled: false
        }
	}

    componentDidMount() {
        const { props } = this
        const { points, requestFleet, requestPoints, flyingAircraft, fleet, flyAircraft } = props

        if( Object.keys( fleet ).length <= 0 || stale() ) {
            requestFleet()
        }

        if( Object.keys( points ).length <= 0 || stale() ) {
            requestPoints()
        }

        // if( !flyingAircraft ) {
        //     const aircraft = Object.keys( fleet ).map( k => fleet[ k ] ).find( a => a.name === getLocalStorage( 'aircraft' ) )
        //     if( aircraft ) {
        //         flyAircraft( aircraft.id )
        //     }
        // }
    }


    addFlight = () => {
        const { props, destinationRef, altitudeRef, speedRef, chargeRef } = this
        const { aircraftId, addFlight, originId, points } = props

        // const name = nameRef.current.value
        // const aircraftId = selectAircraftRef.current.value
        const destinationId = getIdFromText( destinationRef.current.value )
        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value
        const charge = chargeRef.current.value

        if( aircraftId && originId && destinationId && altitude && speed && charge ) {
            addFlight( aircraftId, originId, destinationId, altitude, speed, charge )
        }
    }

    checkAdd = () => {
        const { props, destinationRef, altitudeRef, speedRef, chargeRef } = this
        const { aircraftId, addFlight, originId, points } = props

        const destinationId = getIdFromText( destinationRef.current.value )
        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value
        const charge = chargeRef.current.value

        this.setState ( {
            addEnabled: aircraftId && originId && destinationId && altitude && speed && charge
        } )
    }

    render() {
        const { addFlight, props, checkAdd } = this
        const { aircraftId, fleet, points } = props

        const aircraft = fleet && aircraftId && fleet[ aircraftId ] || {}
        const { name: aircraftName, base, origin, destination: destinationId } = aircraft
        const originId = origin || base
        const originPoint = points[ originId ]
        const originAirportName = originPoint && originPoint.name
        const destinationPoint = points[ destinationId ]
        const destinationAirportName = destinationPoint && destinationPoint.name

        if( !aircraftName ) {
            return <Redirect to={`/aircraft`} />
        }

        if( destinationAirportName && aircraftId ) {
            return <Redirect to={`/supervise?a=${aircraftId}`} />
        }

                // <span className="addFlightText">Visit http://gas/supervise?a={aircraftId} to supervise this vehicle (in a desktop browser as mobile isn't friendly yet)</span>
        return (
            <div className="addFlight">
                <h1 className="addFlightName">{aircraftName}</h1>
                <div className="addFlightFields">
                    <span className="addFlightField addFlightParked">from {originAirportName} to:</span>
                    <input type="text" placeholder="Destination (for now, airport like KSJC, KSFO, KSAC, etc.)..." className="addFlightField addDestination" ref={this.destinationRef} onKeyUp={checkAdd} />
                </div>
                <div className="addFlightFields">
                    <input type="number" placeholder="Altitude (ft)..." className="addFlightField addAltitude" ref={this.altitudeRef} onKeyUp={checkAdd} />
                    <input type="number" placeholder="Speed (kts)..." className="addFlightField addSpeed" ref={this.speedRef} onKeyUp={checkAdd} />
                    <input type="number" placeholder="Charge/fuel level % ..." className="addFlightField addCharge" ref={this.chargeRef} onKeyUp={checkAdd} />
                </div>
                <div className="addFlightFields">
                	<button className="addButton" onClick={addFlight} disabled={!this.state.addEnabled} >Launch</button>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { fleet, points, flyingAircraft: aircraftId } = state

    return {
        aircraftId,
        fleet,
        points,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        addFlight: ( aircraftId, originId, destinationId, altitude, speed, charge ) => {
            dispatch( addFlight( aircraftId, originId, destinationId, altitude, speed, charge ) )
        },
        flyAircraft: ( aircraftId ) => {
            dispatch( flyAircraft( aircraftId ) )
        },
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
)(AddFlight)
