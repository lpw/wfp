import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
// import TextInput from 'react-autocomplete-input';
import { addAircraftRouteFly, requestFleet, requestPoints, flyAircraft } from '../actions'
import { setLocalStorage, getLocalStorage, getIdFromText } from '../utils'
import './Add.css' 

const storedAircraft = getLocalStorage( 'aircraft' )

const stale = () => false // TBD what determines when to refetch flight  - always for now

class Add extends Component {
	constructor(props) {
		super(props)

        this.nameRef = React.createRef()
        this.originRef = React.createRef()
        this.destinationRef = React.createRef()
        this.altitudeRef = React.createRef()
        this.speedRef = React.createRef()

        this.state = {
            enabled: false,
            addedName: storedAircraft,
        }
	}

    componentDidMount() {
        const { props } = this
        const { points, requestFleet, requestPoints, fleet } = props

        if( Object.keys( fleet ).length <= 0 || stale() ) {
            requestFleet()
        }

        if( Object.keys( points ).length <= 0 || stale() ) {
            requestPoints()
        }
    }

    // componentWillReceiveProps( nextProps ) {
    //     const { points, requestFleet, requestPoints, flyingAircraft, flyAircraft, fleet } = nextProps

    //     if( !flyingAircraft ) {
    //         const aircraft = Object.keys( fleet ).map( k => fleet[ k ] ).find( a => a.name === getLocalStorage( 'aircraft' ) )
    //         if( aircraft ) {
    //             flyAircraft( aircraft.id )
    //         }
    //     }
    // }

    add = () => {
        const { props, nameRef, originRef, destinationRef, altitudeRef, speedRef } = this
        const { points, addAircraftRouteFly } = props

        const name = nameRef.current.value

        const originPointName = originRef.current.value ? originRef.current.value : originRef.current.recentValue
        // const point = Object.keys( points ).find( k => points[ k ].code.toUpperCase() === originPointName.toUpperCase() )
        const originId = getIdFromText( originPointName, points )

        const destinationPointName = destinationRef.current.value ? destinationRef.current.value : destinationRef.current.recentValue
        const destinationId = getIdFromText( destinationPointName, points )

        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value

        if( name && originId && destinationId && altitude && speed ) {
            // addAircraft( name, point )
            // addRoute( origin, destination, altitude, speed )
            addAircraftRouteFly( name, originId, destinationId, altitude, speed )

            setLocalStorage( 'aircraft', name )

            nameRef.current.value = ''
            originRef.current.value = ''
            destinationRef.current.value = ''
            altitudeRef.current.value = ''
            speedRef.current.value = ''

            this.setState({
                addedName: name
            })
        }
    }

    check = () => {
        const { props, nameRef, originRef, destinationRef, altitudeRef, speedRef } = this
        const { points, addAircraftRouteFly } = props

        const name = nameRef.current.value

        const originPointName = originRef.current.value ? originRef.current.value : originRef.current.recentValue
        const originId = getIdFromText( originPointName, points )

        const destinationPointName = destinationRef.current.value ? destinationRef.current.value : destinationRef.current.recentValue
        const destinationId = getIdFromText( destinationPointName, points )

console.log( 'LANCE check', originId, destinationId )

        if( originId ) {
            originRef.current.value = points[ originId ].code
        }

        if( destinationId ) {
            destinationRef.current.value = points[ destinationId ].code
        }

        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value

        this.setState ( {
            enabled: name && originId && destinationId && altitude && speed
        } )
    }

    render() {
        const { props, add, check, state } = this
        const { fleet, aircraft } = props
        const { enabled, addedName } = state
        const foundNamedAircraft = Object.keys( fleet ).map( k => fleet[ k ] ).find( a => a.name === addedName )

        if( foundNamedAircraft ) {
            return <Redirect to={`/supervise?a=${foundNamedAircraft.id}`} />  // ?a=123 ?
        }

                // <input type="text" onKeyUp={check} onBlur={check} className="addField addOrigin" ref={this.originRef} placeholder="Location (for now, airport like KSJC, KSFO, KSAC, etc.)......" />
                // <button className="addButton" onClick={add} disabled={ !this.state.enabled }>Add</button>
        return (
            <div className="add">
                <h1 className="addTitle">Add Aircraft and Route to Fly</h1>
                <input type="text" onKeyUp={check} onBlur={check} className="addName" ref={this.nameRef} placeholder="Aircraft identifier, name, tail-number, etc..." />
                    <div className="addLocations addRowFields">
                        <input type="text" placeholder="Location (airport like KSJC, KSFO, KSAC, etc.)..." className="addOrigin" onKeyUp={check} ref={this.originRef} />
                        <div className="addArrow">&#x2192;</div>
                        <input type="text" placeholder="Destination (airport like KSJC, KSFO, KSAC, etc.)..." className="addDestination" onKeyUp={check} ref={this.destinationRef} />
                    </div>
                <div className="addRowFields">
                    <input type="number" placeholder="Altitude to fly to destination..." className="addAltitude" onKeyUp={check} ref={this.altitudeRef} />
                    <div className="addArrow"></div>
                    <input type="number" placeholder="Speed to fly to destination..." className="addSpeed" onKeyUp={check} ref={this.speedRef} />
                </div>
                <button className="addButton" disabled={!enabled} onClick={add}>Add</button>

            </div>
        )
    }
}

const mapStateToProps = state => {
    const { fleet, points, flyingAircraft } = state

    // const aircraft = Object.keys( fleet ).map( k => fleet[ k ] ).find( a => a.name === storedAircraft )
    const aircraft = fleet && flyingAircraft && fleet[ flyingAircraft ]

    return {
        fleet,
        points,
        aircraft,
        flyingAircraft,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        addAircraftRouteFly: ( name, originId, destinationId, altitude, speed ) => {
            dispatch( addAircraftRouteFly( name, originId, destinationId, altitude, speed ) )
        },
        requestFleet: () => {
            dispatch( requestFleet() )
        },
        requestPoints: () => {
            dispatch( requestPoints() )
        },
        // flyAircraft: ( aircraftId ) => {
        //     dispatch( flyAircraft( aircraftId ) )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Add)
