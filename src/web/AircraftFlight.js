import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
// import { requestAircraftFlight } from '../actions'
import {
    // aircraftFlightFromState,
} from '../selectors'
// import './AircraftFlight.css'

class AircraftFlight extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: false, 
            aircraft: null,
        }
    }

    supervise = () => {
        const { props } = this
        const { id } = props  
        
        console.log( 'Supervising', id )
        this.setState({
            aircraft: id
        })
    }

    render() {
        const { props, supervise, state } = this
        const { name, origin, destination, altitude, speed } = props
        const { aircraft } = state

        if( aircraft ) {
            return <Redirect to={`/supervise/${aircraft}`} />
        }

        return (
            <div className="aircraftRow">
                <div className="aircraftRowFields">
                    <span className="aircraftRowName">{ name }</span>
                    <span className="aircraftRowOrigin">{ origin.code }</span>
                    <span className="aircraftRowArrow">&#x2192;</span>
                    <span className="aircraftRowDestination">{ destination.code }</span>
                    <span className="aircraftRowAltitude">{ altitude } ft</span>
                    <span className="aircraftRowSpeed">{ speed } kts</span>
                </div>
                <button className="aircraftRowButton" onClick={supervise} disabled={ this.state.disabled }>Supervise</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // const { userId } = state
    // const aircraftFlight = aircraftFlightFromState( state )

    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // requestAircraftFlight: () => {
        //     dispatch( requestAircraftFlight() )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftFlight)