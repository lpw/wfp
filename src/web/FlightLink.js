import React from 'react'
import { NavLink } from 'react-router-dom'
import './FlightLink.css'

function FlightLink( props ) {
    const { id, name, author, distance, pointCount } = props

    return (
        <NavLink to={`/flight/${id}`}>
	        <div className="FlightLink">
                <div>{ name }</div>
            	{ author && <i>by { author }</i> }
                <div>{ distance }</div>
            	<i>{ pointCount } points</i>
	        </div>
        </NavLink>
    );
}

export default FlightLink
