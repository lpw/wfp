import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteAircraft } from '../actions'
import {
    // aircraftParkedFromState,
} from '../selectors'
// import './AircraftParked.css'

class AircraftParked extends Component {
    constructor(props) {
        super(props);

        this.speedRef = React.createRef()
        this.altitudeRef = React.createRef()
        this.destinationRef = React.createRef()

        this.state = { disabled: true }
    }

    check = () => {
        const { speedRef, altitudeRef, destinationRef } = this
        // const { id } = props  

        const speed = speedRef.current.value
        const altitude = altitudeRef.current.value
        const destination = destinationRef.current.value

        this.setState ( {
            disabled: !speed || !altitude || !destination
        } )
    }

    launch = () => {
        const { props, speedRef, altitudeRef, destinationRef } = this
        const { id, deleteAircraft } = props  

        const speed = speedRef.current.value
        const altitude = altitudeRef.current.value
        const destination = destinationRef.current.value

        if( speed === '0' && altitude === '0' && destination === '0' ) {
            deleteAircraft( id )
        }

        if( speed && altitude && destination ) {
            console.log( 'Supervising', id )
        }
    }

    render() {
        const { props, launch, check } = this
        const { name, origin } = props

        return (
            <div className="aircraftRow">
                <div className="aircraftRowFields">
                    <span className="aircraftRowName">{ name }</span>
                    <span className="aircraftRowOrigin">{ origin }</span>
                    <input type="text" onKeyUp={check} onBlur={check} className="aircraftRowDestination" ref={this.destinationRef} placeholder="destination..." />
                    <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowAltitude" ref={this.altitudeRef} placeholder="altitude..." />
                    <input type="number" onKeyUp={check} onBlur={check} className="aircraftRowSpeed" ref={this.speedRef} placeholder="speed..." />
                </div>
                <button className="aircraftRowButton" onClick={launch} disabled={ this.state.disabled }>Launch</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // const { userId } = state
    // const aircraftParked = aircraftParkedFromState( state )

    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        deleteAircraft: ( id ) => {
            dispatch( deleteAircraft( id ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftParked)
