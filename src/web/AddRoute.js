import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addRoute } from '../actions'
import './AddRoute.css'

// obsolete, or have to change description to path and add speed

class AddRoute extends Component {
	constructor(props) {
		super(props);
        this.descriptionRef = React.createRef()
		this.altitudeRef = React.createRef()
	}

    addRoute = () => {
        const { props, descriptionRef, altitudeRef } = this
        const { addRoute, id } = props

        const description = descriptionRef.current.value
        const altitude = altitudeRef.current.value || 0

        assert( id )

        if( description ) {
	        addRoute( id, description, altitude )
        }
    }

    render() {
        const { addRoute } = this

        return (
            <div className="AddRoute">
                <input type="text" placeholder="route from skyvector -> foreflight URL format..." className="AddRouteName" ref={this.descriptionRef} />
                <input type="number" placeholder="altitude..." className="AddRouteAltitude" ref={this.altitudeRef} />
            	<button onClick={addRoute}>Add</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = ( dispatch, /* ownProps */ ) => {
    return {
        addRoute: ( id, description, altitude ) => {
            dispatch( addRoute( id, description, altitude ) )
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddRoute)
