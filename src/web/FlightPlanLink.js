import React from 'react'
import { NavLink } from 'react-router-dom'
import './FlightPlanLink.css'

function FlightPlanLink( props ) {
    const { id, name, author, distance, pointCount } = props

    return (
        <NavLink to={`/flight/${id}`}>
	        <div className="FlightPlanLink">
                <div>{ name }</div>
            	{ author && <i>by { author }</i> }
                <div>{ distance }</div>
            	<i>{ pointCount } points</i>
	        </div>
        </NavLink>
    );
}

export default FlightPlanLink
