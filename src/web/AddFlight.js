import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { addFlightWithRoute } from '../actions'
import './AddFlight.css'

class AddFlight extends Component {
	constructor(props) {
		super(props);

        const { mostRecentlyAddedFlight } = props

        this.selectAircraftRef = React.createRef()
        // this.nameRef = React.createRef()
        this.pathRed = React.createRef()
        this.altitudeRef = React.createRef()
        this.speedRef = React.createRef()

        this._mostRecentlyAddedFlight = mostRecentlyAddedFlight

        this.state = {
            addEnabled: false
        }
	}

    addFlightWithRoute = () => {
        const { props, selectAircraftRef, pathRed, altitudeRef, speedRef } = this
        const { addFlightWithRoute } = props

        // const name = nameRef.current.value
        const aircraftId = selectAircraftRef.current.value
        const path = pathRed.current.value
        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value

        if( aircraftId && path && altitude && speed ) {
            addFlightWithRoute( aircraftId, path, altitude, speed )
        }
    }

    checkAdd = () => {
        const { selectAircraftRef, pathRed, altitudeRef, speedRef } = this

        const aircraftId = selectAircraftRef.current.value
        const path = pathRed.current.value
        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value

        this.setState ( {
            addEnabled: aircraftId && path && altitude && speed
        } )
    }

    render() {
        const { addFlightWithRoute, props, _mostRecentlyAddedFlight, checkAdd } = this
        const { mostRecentlyAddedFlight, aircraft } = props

        if( mostRecentlyAddedFlight !== _mostRecentlyAddedFlight ) {
            return <Redirect to={`/flight/${mostRecentlyAddedFlight}`} />
        }

                // <input type="text" placeholder="Name..." className="AddName" ref={this.nameRef} />
                // <select onChange={loginUser} className="login" id="login" ref={this.userRef}>
                    // <option value="">{ loggedInUserName ? `Logout ${loggedInUserName}` : 'Login' }</option>
        return (
            <div className="AddFlight">
                <select onChange={checkAdd} className="selectAircraft" ref={this.selectAircraftRef}>
                    <option value="" selected disabled>Aircraft</option>
                    { aircraft.map( a => <option key={a.id} value={a.id}>{a.name}</option> ) }
                </select>
                <input type="text" placeholder="Route (for now, airports like 'KSJC KSFO KSAC')..." className="AddPath" ref={this.pathRed} onKeyUp={checkAdd} />
                <input type="number" placeholder="Altitude..." className="AddAltitude" ref={this.altitudeRef} onKeyUp={checkAdd} />
                <input type="number" placeholder="Speed..." className="AddSpeed" ref={this.speedRef} onKeyUp={checkAdd} />
            	<button onClick={addFlightWithRoute} disabled={!this.state.addEnabled} >Launch</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { mostRecentlyAddedFlight, aircraft } = state

    return {
        mostRecentlyAddedFlight,
        aircraft
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        addFlightWithRoute: ( aircraftId, path, altitude, speed ) => {
            dispatch( addFlightWithRoute( aircraftId, path, altitude, speed ) )
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddFlight)
