import assert from 'assert'
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import './SuperviseParkedAircraft.css'

class SuperviseParkedAircraft extends Component {
    render() {
        const { props } = this
        const { id, name, locationCode, close } = props
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
