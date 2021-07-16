import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
// import TextInput from 'react-autocomplete-input';
import { addAircraft, requestFleet, requestPoints, flyAircraft } from '../actions'
import { setLocalStorage, getLocalStorage, getIdFromText } from '../utils'
import './AddAircraft.css' 

// const storedAircraft = getLocalStorage( 'aircraft' )

const stale = () => true // TBD what determines when to refetch flight  - always for now

class AddAircraft extends Component {
	constructor(props) {
		super(props)

        this.nameRef = React.createRef()
        this.originRef = React.createRef()

        this.state = {
            addEnabled: false,
            // addedName: null,
        }
	}

    componentDidMount() {
        const { props } = this
        const { points, requestFleet, requestPoints, flyingAircraft, flyAircraft, fleet } = props

        if( Object.keys( fleet ).length <= 0 || stale() ) {
            requestFleet()
        }

        if( Object.keys( points ).length <= 0 || stale() ) {
            requestPoints()
        }
    }

    componentWillReceiveProps( nextProps ) {
        const { points, requestFleet, requestPoints, flyingAircraft, flyAircraft, fleet } = nextProps

        if( !flyingAircraft ) {
            const aircraft = Object.keys( fleet ).map( k => fleet[ k ] ).find( a => a.name === getLocalStorage( 'aircraft' ) )
            if( aircraft ) {
                flyAircraft( aircraft.id )
            }
        }
    }

    addAircraft = () => {
        const { props, nameRef, originRef } = this
        const { points, addAircraft } = props

        const name = nameRef.current.value
        const pointName = originRef.current.value ? originRef.current.value : originRef.current.recentValue
        // const point = Object.keys( points ).find( k => points[ k ].code.toUpperCase() === pointName.toUpperCase() )
        const point = getIdFromText( pointName, points )

        if( name && point ) {
            addAircraft( name, point )

            setLocalStorage( 'aircraft', name )

            nameRef.current.value = ''
            originRef.current.value = ''

            // this.setState({
            //     addedName: name
            // })
        }
    }

    checkAdd = () => {
        const { props, nameRef, originRef } = this
        const { points } = props

        const name = nameRef.current.value
        const pointName = originRef.current.value ? originRef.current.value : originRef.current.recentValue
        // const point = Object.keys( points ).find( k => points[ k ].code.toUpperCase() === pointName.toUpperCase() )
        const point = getIdFromText( pointName, points )

        this.setState ( {
            addEnabled: name && point
        } )
    }

    render() {
        const { props, addAircraft, checkAdd, state } = this
        const { fleet, aircraft } = props
        // const { addedName } = state
        // const foundName = Object.keys( fleet ).map( k => fleet[ k ] ).find( a => a.name === addedName )

        if( aircraft ) {
            return <Redirect to={`/flight`} />  // ?a=123 ?
        }

        return (
            <div className="addAircraft">
                <h1 className="addFlightName">Add Aircraft to Fleet</h1>
                <input type="text" onKeyUp={checkAdd} onBlur={checkAdd} className="addAircraftField addAircraftName" ref={this.nameRef} placeholder="Aircraft identifier, name, tail-number, etc..." />
                <input type="text" onKeyUp={checkAdd} onBlur={checkAdd} className="addAircraftField addAircraftOrigin" ref={this.originRef} placeholder="Location (for now, airport like KSJC, KSFO, KSAC, etc.)......" />
                <button className="addAircraftButton" onClick={addAircraft} disabled={ !this.state.addEnabled }>Add</button>
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
        addAircraft: ( name, pointId ) => {
            dispatch( addAircraft( name, pointId ) )
        },
        requestFleet: () => {
            dispatch( requestFleet() )
        },
        requestPoints: () => {
            dispatch( requestPoints() )
        },
        flyAircraft: ( aircraftId ) => {
            dispatch( flyAircraft( aircraftId ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddAircraft)
