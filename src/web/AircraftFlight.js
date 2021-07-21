import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
// import { requestAircraftFlight } from '../actions'
import {
    // aircraftFlightFromState,
} from '../selectors'
// import './AircraftFlight.css' imported from fleet

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
        const { 
            props, 
            state,
            supervise,
            schedule,
            history,
         } = this
        const { id, name, origin, destination, altitude, speed, maintenance } = props
        const { aircraft } = state

        if( aircraft ) {
            // return <Redirect to={`/supervise/${aircraft}`} />
            return <Redirect to={`/supervise?a=${aircraft}`} />
        }

                    // <span className="aircraftRowAltitude">{ altitude } ft</span>
                    // <span className="aircraftRowSpeed">{ speed } kts</span>
        // return (
        //     <div className="aircraftRow">
        //         <div className="aircraftRowFields">
        //             <span className="aircraftRowName">{ name }
        //             </span>
        //             <span className="aircraftRowButtons">
        //                 <button className="aircraftRowButton aircraftRowButtonSchedule" onClick={ schedule } disabled={ true }>Schedule</button>
        //                 <button className="aircraftRowButton aircraftRowButtonHistory" onClick={ history } disabled={ true }>History</button>
        //                 <button className="aircraftRowButton aircraftRowButtonMaintenance" onClick={ maintenance } disabled={ true }>Maintenance</button>
        //             </span>
        //             <span className="aircraftRowPath">
        //                 <span className="aircraftRowOrigin">{ origin.code }</span>
        //                 <span className="aircraftRowArrow">&#x2192;</span>
        //                 <span className="aircraftRowDestination">{ destination.code }</span>
        //             </span>
        //             <span className="aircraftAltitudeAndSpeed">
        //                 <span className="aircraftRowAltitude">{ altitude } ft</span>
        //                 <span className="aircraftRowSpeed">{ speed } kts</span>
        //             </span>
        //         </div>
        //         <button className="aircraftRowButton aircraftRowRightButton" onClick={supervise} disabled={ this.state.disabled }>Supervise</button>
        //     </div>
        // )
                    // <button className="aircraftRowButtonSchedule" onClick={ schedule } disabled={ true }>Schedule</button>
                    // <span className="aircraftRowAltitude">{ altitude } ft</span>
                    // <span className="aircraftRowSpeed">{ speed } kts</span>
        return (
            <div className="aircraftRow">
                 <div className="aircraftRowFields">
                    <span className="aircraftRowName">{ name }</span>
                    <button className="aircraftRowButtonHistory" onClick={ history }>Flights</button>
                    <button className="aircraftRowButtonMaintenance" onClick={ () => maintenance( id ) }>Maintenance</button>
                    <span className="aircraftRowOrigin">{ origin.code }</span>
                    <span className="aircraftRowArrow">&#x2192;</span>
                    <span className="aircraftRowDestination">{ destination.code }</span>
                </div>
                <button className="aircraftRowRightButton" onClick={supervise} disabled={ this.state.disabled }>Supervise</button>
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
