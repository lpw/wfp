import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getIdFromText } from '../utils'
import { addAircraft, requestPoints } from '../actions'
// import './AircraftAdd.css' using AircraftFlight, which is imported from fleet

class AircraftAdd extends Component {
	constructor(props) {
		super(props)

        this.nameRef = React.createRef()
        this.originRef = React.createRef()

        this.state = {
            addEnabled: false
        }
	}

    componentDidMount() {
        const { props } = this
        const { points, requestPoints } = props

        if( Object.keys( points ).length <= 0 ) {   // || stale() ) {
            requestPoints()
        }
    }

    addAircraft = () => {
        const { props, nameRef, originRef } = this
        const { points, addAircraft } = props

        const name = nameRef.current.value
        const pointName = originRef.current.value ? originRef.current.value : originRef.current.recentValue
        const point = getIdFromText( pointName, points )

        if( name && point ) {
            addAircraft( name, point )
            nameRef.current.value = ''
            originRef.current.value = ''
        }
    }

    checkAdd = () => {
        const { props, nameRef, originRef } = this
        const { points } = props

        const name = nameRef.current.value
        const pointName = originRef.current.value ? originRef.current.value : originRef.current.recentValue
        const point = getIdFromText( pointName, points )

        if( point ) {
            originRef.current.value = points[ point ].code
        }

        this.setState ( {
            addEnabled: name && point
        } )
    }

    render() {
        const { addAircraft, checkAdd } = this

        return (
            <div className="aircraftRow">
                <div className="aircraftRowFields">
                    <input type="text" onKeyUp={checkAdd} onBlur={checkAdd} className="aircraftRowName" ref={this.nameRef} placeholder="Aircraft identifier..." />
                    <span className="aircraftRowButtonSchedule"></span>
                    <span className="aircraftRowButtonHistory"></span>
                    <span className="aircraftRowButtonMaintenance"></span>
                    <input type="text" onKeyUp={checkAdd} onBlur={checkAdd} className="aircraftRowOrigin" ref={this.originRef} placeholder="Location..." />
                    <span className="aircraftRowArrow"></span>
                    <span className="aircraftRowDestination"></span>
                </div>
                <button className="aircraftRowRightButton" onClick={addAircraft} disabled={ !this.state.addEnabled }>Add</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { points } = state

    return {
        points
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        addAircraft: ( name, pointId ) => {
            dispatch( addAircraft( name, pointId ) )
        },
        requestPoints: ( name, pointId ) => {
            dispatch( requestPoints( name, pointId ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftAdd)
