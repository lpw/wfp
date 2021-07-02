import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { addFlightPlanWithRoute } from '../actions'
import './AddFlightPlan.css'

class AddFlightPlan extends Component {
	constructor(props) {
		super(props);

        const { mostRecentlyAddedFlightPlan } = props

        this.nameRef = React.createRef()
        this.pathRed = React.createRef()
        this.altitudeRef = React.createRef()
        this.speedRef = React.createRef()

        this._mostRecentlyAddedFlightPlan = mostRecentlyAddedFlightPlan
	}

    addFlightPlanWithRoute = () => {
        const { props, nameRef, pathRed, altitudeRef, speedRef } = this
        const { addFlightPlanWithRoute, userId } = props

        const name = nameRef.current.value
        const path = pathRed.current.value
        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value

        if( name && path && altitude && speed ) {
	        addFlightPlanWithRoute( name, path, altitude, speed, userId )
        }
    }

    render() {
        const { addFlightPlanWithRoute, props, _mostRecentlyAddedFlightPlan } = this
        const { mostRecentlyAddedFlightPlan } = props

        if( mostRecentlyAddedFlightPlan !== _mostRecentlyAddedFlightPlan ) {
            return <Redirect to={`/flight/${mostRecentlyAddedFlightPlan}`} />
        }

        return (
            <div className="AddFlightPlan">
                <input type="text" placeholder="Name..." className="AddName" ref={this.nameRef} />
                <input type="text" placeholder="Route (for now, airports like 'KSJC KSFO KSAC')..." className="AddPath" ref={this.pathRed} />
                <input type="number" placeholder="Altitude..." className="AddAltitude" ref={this.altitudeRef} />
                <input type="number" placeholder="Speed..." className="AddSpeed" ref={this.speedRef} />
            	<button onClick={addFlightPlanWithRoute}>Add</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { mostRecentlyAddedFlightPlan, userId } = state

    return {
        mostRecentlyAddedFlightPlan,
        userId
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        addFlightPlanWithRoute: ( name, path, altitude, speed, userId ) => {
            dispatch( addFlightPlanWithRoute( name, path, altitude, speed, userId ) )
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddFlightPlan)
