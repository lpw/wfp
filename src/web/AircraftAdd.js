import React, { Component } from 'react'
import { connect } from 'react-redux'
// import TextInput from 'react-autocomplete-input';
import { getIdFromText } from '../utils'
import { addAircraft } from '../actions'
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

    // componentDidMount() {
    //     const { props } = this
    //     const { points, requestPoints } = props

    //     if( Object.keys( points ).length <= 0 || stale() ) {
    //         requestPoints()
    //     }
    // }

    addAircraft = () => {
        const { props, nameRef, originRef } = this
        const { points, addAircraft } = props

        const name = nameRef.current.value
        const pointName = originRef.current.value ? originRef.current.value : originRef.current.recentValue
        // const point = Object.keys( points ).find( k => points[ k ].code.toUpperCase() === pointName.toUpperCase() )
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
        // const point = Object.keys( points ).find( k => points[ k ].code.toUpperCase() === pointName.toUpperCase() )
        const point = getIdFromText( pointName, points )

        this.setState ( {
            addEnabled: name && point
        } )
    }

    render() {
        const { addAircraft, checkAdd } = this
        // const { points } = props
        // const pointOptions = Object.keys( points ).map( k => points[ k ].code )

                // <input type="text" placeholder="Location, airport code, etc" className="AddPoint" ref={this.originRef} onKeyUp={checkAdd} />
            // <div className="AircraftAdd">
            //     <input type="text" placeholder="Aircraft name, or tail-number, etc." className="AddName" ref={this.nameRef} onKeyUp={checkAdd} />
            //     <button onClick={addAircraft} disabled={!this.state.addEnabled} >Add</button>
            // </div>
                    // <span className="aircraftRowOrigin">
                    //     <TextInput trigger={[""]} maxOptions={200} Component="input" options={pointOptions} ref={this.originRef} changeOnSelect={checkAdd}/>
                    // </span>
                    // <span className="aircraftRowButtonSchedule"></span>
                    // <span className="aircraftRowAltitude"></span>
                    // <span className="aircraftRowSpeed"></span>
        return (
            <div className="aircraftRow">
                <div className="aircraftRowFields">
                    <input type="text" onKeyUp={checkAdd} onBlur={checkAdd} className="aircraftRowName" ref={this.nameRef} placeholder="Aircraft identifier..." />
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
    // const { points } = state

    return {
    //     points
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        addAircraft: ( name, pointId ) => {
            dispatch( addAircraft( name, pointId ) )
        },
        // requestPoints: ( name, pointId ) => {
        //     dispatch( requestPoints( name, pointId ) )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AircraftAdd)
