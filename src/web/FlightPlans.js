import React, { Component } from 'react'
import { connect } from 'react-redux'
import { requestFlightPlans } from '../actions'
import FlightPlanLink from './FlightPlanLink'
import AddFlightPlan from './AddFlightPlan'
import {
    flightPlansFromState,
    userNameFromId,
} from '../selectors'
import './FlightPlan.css'

const stale = () => true // TBD what determines when to refetch flight plan - always for now

class FlightPlans extends Component {
    componentDidMount() {
        const { props } = this
        const { flightPlans, requestFlightPlans } = props

        if( flightPlans.length <= 0 || stale() ) {
            requestFlightPlans()
        }
    }

    renderFlightPlan = flightPlan => {
        const { id, name, authorName, distance, pointCount } = flightPlan  // altitude, duration - depends]
        return <FlightPlanLink key={id} id={id} name={name} author={authorName} distance={distance} pointCount={pointCount} />
    }

    renderFlightPlans = flightPlans => {
        const { renderFlightPlan } = this

        return (
            <React.Fragment>
                { flightPlans.map( p => renderFlightPlan( p ) ) }
            </React.Fragment>
        )
    }

    render() {
        const { renderFlightPlans, props } = this
        const { flightPlans, userId } = props

        return (
            <div className="flightPlans">
                { renderFlightPlans( flightPlans ) }
                { !!userId && <AddFlightPlan /> }
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { userId } = state
    const flightPlans = flightPlansFromState( state )
    const flightPlansWithAuthor = flightPlans.map( fp => ({
        ...fp,
        authorName: userNameFromId( state, +fp.author )
    }))

    return {
        flightPlans: flightPlansWithAuthor,
        userId
    }
}


const mapDispatchToProps = dispatch => {
    return {
        requestFlightPlans: () => {
            dispatch( requestFlightPlans() )
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlightPlans)
