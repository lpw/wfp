// import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Airspeed,
  Altimeter,
  AttitudeIndicator,
  HeadingIndicator,
  TurnCoordinator,
  Variometer
} from 'react-flight-indicators'
import './SixPack.css'

class SixPack extends Component {
    render() {
        const { props } = this
        const { size, heading, speed, altitude } = props

        return (
            <div className="">
                <div className="topRowSixPack">
                    <Airspeed size={ size } className="oneOfSixPack" speed={ speed } showBox={false} />
                    <HeadingIndicator size={ size } className="oneOfSixPack" heading={ heading } showBox={false} />
                    <Altimeter size={ size } className="oneOfSixPack" altitude={ altitude } showBox={false} />
                </div>
                <div className="bottomRowoneOfSixPack">
                    <TurnCoordinator size={ size } className="oneOfSixPack" turn={0} showBox={false} />
                    <AttitudeIndicator size={ size } className="oneOfSixPack" roll={0} pitch={0} showBox={false} />
                    <Variometer size={ size } className="oneOfSixPack" vario={0} showBox={false} />
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
)(SixPack)
