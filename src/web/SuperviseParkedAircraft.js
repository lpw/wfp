import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import {
    requestFleet,
    requestPoints,
} from '../actions'
import './SuperviseParkedAircraft.css'

class SuperviseParkedAircraft extends Component {
    render() {
        const { props } = this
        const { id, fleet, locationCode, close } = props
        const aircraft = fleet[ id ]
        const { name } = aircraft
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
        assert( locationCode )
        return (
            <div key={ id } className={ selectedAircraftClassNames }>
                <div className="selectedNameAndParked">
                    <span className="selectedAircraftNameParked">{ name }</span>
                    <span className="selectedAircraftOriginParked">Landed at { locationCode }</span>
                    <span className="selectedAircraftCloseParked">
                        <button className="selectedCloseButton" onClick={ () => close( id ) }>X</button>
                    </span>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ( state, props ) => {
    return {
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SuperviseParkedAircraft)
