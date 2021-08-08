// import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { requestRoutes } from '../actions'
import AddRoute from './AddRoute'
import Route from './Route'
import './Routes.css'

class Routes extends Component {
    componentDidMount() {
        const { props } = this
        const { routes, requestRoutes } = props

        if( Object.keys( routes ).length <= 0 ) {
            requestRoutes()
        }
    }

    renderRoute = ( k, route ) => {
        const { 
            id,
            altitude,
            speed,
            originCode,
            destinationCode,
            removed,
        } = route

        return id && originCode && destinationCode && !removed && 
            <Route 
                key={id}
                id={id}
                originCode={originCode}
                destinationCode={destinationCode}
                altitude={altitude}
                speed={speed}
            />
    }

    renderOriginRoutes = ( k, i ) => {
        const { props, renderRoute } = this
        const { routes: origins } = props
        const originRoutes = origins[ k ]

        return (
            <React.Fragment key={i}>
                { originRoutes.map( r => renderRoute( k, r ) ) }
            </React.Fragment>
        )
    }

    renderOrigins = () => {
        const { props, renderOriginRoutes } = this
        const { routes: origins } = props
        const originKeys = Object.keys( origins )

        return (
            <React.Fragment>
                { originKeys.map( ( k, i ) => renderOriginRoutes( k, i ) ) }
            </React.Fragment>
        )
    }

    render() {
        const { renderOrigins } = this

        return (
            <div className="routes">
                { renderOrigins() }
                <AddRoute />
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { routes } = state

    return {
        routes,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        requestRoutes: () => {
            dispatch( requestRoutes() )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Routes)
