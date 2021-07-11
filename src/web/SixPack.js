// import assert from 'assert'
import React, { Component } from 'react'
// import classNames from 'classnames'
import { connect } from 'react-redux'
import {
  Airspeed,
  Altimeter,
  AttitudeIndicator,
  HeadingIndicator,
  TurnCoordinator,
  Variometer
} from 'react-flight-indicators'
// import {
//     requestFleet,
// } from '../actions'
// import {
// } from '../selectors'
import './SixPack.css'

// const stale = () => true // TBD what determines when to refetch stages and status of supervise  - always for now

class SixPack extends Component {
    // constructor(props) {
    //     super( props )
    //     this.state = {
    //         showSixPack: false
    //     }
    // }

    // componentDidMount() {
    //     const { props } = this
    //     const {
    //         fleet,
    //         requestFleet,
    //     } = props
    //     if( fleet.length <= 0 || stale() ) {
    //         requestFleet()
    //     }
    // }

    render() {
        const { props } = this
        const { size } = props
        return (
            <div className="">
                <div className="topRowSixPack">
                    <HeadingIndicator size={ size } className="oneOfSixPack" heading={Math.random() * 360} showBox={false} />
                    <Airspeed size={ size } className="oneOfSixPack" speed={Math.random() * 160} showBox={false} />
                    <Altimeter size={ size } className="oneOfSixPack" ltitude={Math.random() * 28000} showBox={false} />
                </div>
                <div className="bottomRowoneOfSixPack">
                    <AttitudeIndicator size={ size } className="oneOfSixPack" roll={(Math.random() - 0.5) * 120} pitch={(Math.random() - 0.5) * 40} showBox={false} />
                    <TurnCoordinator size={ size } className="oneOfSixPack" turn={(Math.random() - 0.5) * 120} showBox={false} />
                    <Variometer size={ size } className="oneOfSixPack" vario={(Math.random() - 0.5) * 4000} showBox={false} />
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
)(SixPack)
