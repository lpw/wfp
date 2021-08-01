import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteAircraft, addFlight } from '../actions'
import { getIdFromText } from '../utils'
import {
    // aircraftParkedFromState,
} from '../selectors'
// import './AircraftParked.css' using AircraftFlight, which is imported from fleet

class AircraftParked extends Component {
    constructor(props) {
        super(props);

        // this.speedRef = React.createRef()
        // this.altitudeRef = React.createRef()
        this.destinationRef = React.createRef()

        this.state = { disabled: true }
    }

    check = () => {
        const { props, destinationRef } = this
        const { routesFrom } = props  

        // const speed = speedRef.current.value
        // const altitude = altitudeRef.current.value
        // const destination = getIdFromText( destinationRef.current.value, points )

        const { value } = destinationRef.current || {}
        const route = routesFrom.find( r => r.id === +value )
        const { destinationId, altitude, speed } = route || {}
      
        this.setState ( {
            disabled: !speed || !altitude || !destinationId
        } )
    }

    launch = () => {
        const { props, destinationRef } = this
        const { id, addFlight } = props  

        // const speed = speedRef.current.value
        // const altitude = altitudeRef.current.value
        // const destination = getIdFromText( destinationRef.current.value, points )

        const { value } = destinationRef.current || {}
        const routeId = +value
        // const route = routesFrom.find( r => r.id === +value )
        // const { destination, altitude, speed } = route || {}

        if( routeId ) {
            addFlight( id, routeId )
        }
    }

    render() {
        const { 
            props, 
            state,
            launch,
            check,
         } = this
        const { id, name, locationCode, routesFrom, maintenance, schedule, history } = props
        const { disabled } = state 
                    // <input type="text" onKeyUp={check} onBlur={check} className="aircraftRowDestination" ref={this.destinationRef} placeholder="Destination..." />
                    // <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowButton aircraftRowAltitude" ref={this.altitudeRef} placeholder="Altitude..." />
                    // <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowButton aircraftRowSpeed" ref={this.speedRef} placeholder="Speed..." />
        return (
            <div className="aircraftRow">
                 <div className="aircraftRowFields">
                    <span className="aircraftRowName">{ name }</span>
                    <button className="aircraftRowButtonSchedule" onClick={ () => schedule( id ) }>Schedule</button>
                    <button className="aircraftRowButtonHistory" onClick={ () => history( id ) }>History</button>
                    <button className="aircraftRowButtonMaintenance" onClick={ () => maintenance( id ) }>Maintenance</button>
                    <span className="aircraftRowOrigin">{ locationCode }</span>
                    <span className="aircraftRowArrow">&#x2192;</span>
                    <select onChange={check} className="aircraftRowDestination" ref={this.destinationRef}>
                        <option value="">Destination...</option>
                        { routesFrom.map( r => <option key={r.id} value={r.id}>{r.destinationCode} {r.altitude}&#183;ft {r.speed}&#183;kts</option> ) }
                    </select>
                </div>
                <button className="aircraftRowRightButton" onClick={launch} disabled={ disabled }>Request</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // const { userId } = state
    // const aircraftParked = aircraftParkedFromState( state )

    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // addFlight: ( aircraft, origin, destination, altitude, speed ) => {
        //     dispatch( addFlight( aircraft, origin, destination, altitude, speed ) )
        // },
        addFlight: ( aircraft, routeId ) => {
            dispatch( addFlight( aircraft, routeId ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftParked)
