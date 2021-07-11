import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import {
    requestFleet,
    requestPoints,
} from '../actions'
import {
} from '../selectors'
import './SuperviseParkedAircraft.css'

// const stale = () => true // TBD what determines when to refetch stages and status of supervise  - always for now

class SuperviseParkedAircraft extends Component {
    // constructor(props) {
    //     super( props )
    //     this.state = {
    //         showSixPack: false
    //     }
    // }

    // componentDidMount() {
    //     const { props } = this
    //     const {
    //         requestFleet,
    //         fleet,
    //     } = props
    //     if( fleet.length <= 0 || stale() ) {
    //         requestFleet()
    //     }
    //     this.setupMap()
    // }

    renderParkedSelectedAircraft = ( id, originPoint ) => {
        const { props } = this
        const { fleet } = props
        const aircraft = fleet[ id ]
        const { name } = aircraft
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
        assert( originPoint )
console.log( 'LANCE renderParkedSelectedAircraft originPoint', originPoint )
        return (
            <div key={ id } className={ selectedAircraftClassNames }>
                <span className="selectedAircraftName">{ name }</span>
                <span className="selectedAircraftOrigin">{ originPoint.code }</span>
            </div>
        )
    }

    render() {
        const { props } = this
        const { id, fleet, originPoint, close } = props
        const aircraft = fleet[ id ]
        const { name } = aircraft
        const selectedAircraftClassNames = classNames( 'selectedAircraft', {} )
        assert( originPoint )
        return (
            <div key={ id } className={ selectedAircraftClassNames }>
                <div className="selectedNameAndParked">
                    <span className="selectedAircraftNameParked">{ name }</span>
                    <span className="selectedAircraftOriginParked">Landed at { originPoint.code }</span>
                    <span className="selectedAircraftCloseParked">
                        <button className="selectedCloseButton" onClick={ () => close( id ) }>X</button>
                    </span>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ( state, props ) => {
    // const { fleet } = state

    return {
        // fleet,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        // requestFleet: () => {
        //     dispatch( requestFleet() )
        // },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SuperviseParkedAircraft)
