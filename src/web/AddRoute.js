import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getIdFromText } from '../utils'
import { requestPoints, addRoute } from '../actions'
import './AddRoute.css'

const stale = () => false // TBD what determines when to refetch flight  - always for now

class AddRoute extends Component {
	constructor(props) {
		super(props)

        this.originRef = React.createRef()
        this.destinationRef = React.createRef()
        this.altitudeRef = React.createRef()
		this.speedRef = React.createRef()

        this.state = {
            disabled: true
        }
	}

    componentDidMount() {
        const { props } = this
        const { points, requestPoints } = props

        if( Object.keys( points ).length <= 0 || stale() ) {
            requestPoints()
        }
    }

    check = () => {
        const { props, originRef, destinationRef, altitudeRef, speedRef, } = this
        const { points } = props

        const originId = getIdFromText( originRef.current.value, points )
        const destinationId = getIdFromText( destinationRef.current.value, points )

        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value

        if( originId ) {
            originRef.current.value = points[ originId ].code
        }

        if( destinationId ) {
            destinationRef.current.value = points[ destinationId ].code
        }

        const enabled = originId && destinationId && altitude && speed

        this.setState({
            disabled: !enabled
        })
    }

    add = () => {
        const { props, originRef, destinationRef, altitudeRef, speedRef, } = this
        const { add, points } = props

        const originId = getIdFromText( originRef.current.value, points )
        const destinationId = getIdFromText( destinationRef.current.value, points )

        const altitude = altitudeRef.current.value
        const speed = speedRef.current.value

        if( originId && destinationId && altitude && speed ) {
            const originCode = points[ originId ].code
            const destinationCode = points[ destinationId ].code

            window.alert( `Route added from ${originCode} to ${destinationCode}` )

            add( originId, destinationId, altitude, speed )

            originRef.current.value = ''
            destinationRef.current.value = ''
        }
    }

    render() {
        const { add, check, state } = this
        const { disabled } = state

        return (
            <div className="routeRow">
                <div className="routeRowFields">
                    <div className="routeRowLocations">
                        <input type="text" placeholder="to..." className="routeRowOrigin" onKeyUp={check} ref={this.originRef} />
                        <div className="routeRowArrow">&#x2192;</div>
                        <input type="text" placeholder="from..." className="routeRowDestination" onKeyUp={check} ref={this.destinationRef} />
                    </div>
                    <input type="number" placeholder="altitude..." className="routeRowAltitude" onKeyUp={check} ref={this.altitudeRef} />
                    <input type="number" placeholder="speed..." className="routeRowSpeed" onKeyUp={check} ref={this.speedRef} />
                </div>
                <button className="routeRowRightButton" disabled={disabled} onClick={add}>Add</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { points } = state

    return {
        points,
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        add: ( origin, destination, altitude, speed ) => {
            dispatch( addRoute( origin, destination, altitude, speed ) )
        },
        requestPoints: () => {
            dispatch( requestPoints() )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddRoute)
