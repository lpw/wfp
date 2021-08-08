import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
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
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftFlying)
