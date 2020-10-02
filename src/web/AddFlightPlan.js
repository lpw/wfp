import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { addFlightPlan } from '../actions'
import './AddFlightPlan.css'

class AddFlightPlan extends Component {
	constructor(props) {
		super(props);

        const { mostRecentlyAddedFlightPlan } = props

		this.nameRef = React.createRef()

        this._mostRecentlyAddedFlightPlan = mostRecentlyAddedFlightPlan
	}

    componentDidMount() {
        const { props } = this
        const { mostRecentlyAddedFlightPlan } = props
    }

    addFlightPlan = () => {
        const { props, nameRef } = this
        const { addFlightPlan, userId } = props

        const name = nameRef.current.value
        // const route = routeRef.current.value

        if( name ) {
	        addFlightPlan( name, userId )
        }
    }

    render() {
        const { addFlightPlan, props, _mostRecentlyAddedFlightPlan } = this
        const { mostRecentlyAddedFlightPlan } = props

        if( mostRecentlyAddedFlightPlan !== _mostRecentlyAddedFlightPlan ) {
            return <Redirect to={`/flight/${mostRecentlyAddedFlightPlan}`} />
        }

        return (
            <div className="AddFlightPlan">
                <input type="text" placeholder="Flightplan name..." className="AddFlightPlanName" ref={this.nameRef} />
            	<button onClick={addFlightPlan}>Add</button>
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
        addFlightPlan: ( name, userId ) => {
            dispatch( addFlightPlan( name, userId ) )
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddFlightPlan)
