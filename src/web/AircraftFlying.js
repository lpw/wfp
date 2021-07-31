import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
// import { requestAircraftFlying } from '../actions'
import {
    // aircraftFlyingFromState,
} from '../selectors'
// import './AircraftFlying.css' imported from fleet

class AircraftFlying extends Component {
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
         } = this
        const { id, name, originCode, destinationCode, schedule, history, maintenance } = props
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
                    // <span className="aircraftRowAltitude">{ altitude } ft</span>
                    // <span className="aircraftRowSpeed">{ speed } kts</span>
        return (
            <div className="aircraftRow">
                 <div className="aircraftRowFields">
                    <span className="aircraftRowName">{ name }</span>
                    <button className="aircraftRowButtonSchedule" onClick={ () => schedule( id ) }>Schedule</button>
                    <button className="aircraftRowButtonHistory" onClick={ () => history( id ) }>History</button>
                    <button className="aircraftRowButtonMaintenance" onClick={ () => maintenance( id ) }>Maintenance</button>
                    <span className="aircraftRowOrigin">{ originCode }</span>
                    <span className="aircraftRowArrow">&#x2192;</span>
                    <span className="aircraftRowDestination">{ destinationCode }</span>
                </div>
                <button className="aircraftRowRightButton" onClick={supervise} disabled={ this.state.disabled }>Supervise</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // const { userId } = state
    // const aircraftFlying = aircraftFlyingFromState( state )

    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // requestAircraftFlying: () => {
        //     dispatch( requestAircraftFlying() )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftFlying)
