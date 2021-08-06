// import assert from 'assert'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { requestRoutes, addRoute, deleteRoute } from '../actions'
import AddRoute from './AddRoute'
import Route from './Route'
// import { getCodeFromPath } from '../utils'
import {
    // routesFromState,
} from '../selectors'
import './Routes.css'

const stale = () => false // TBD what determines when to refetch flight  - always for now

class Routes extends Component {
    componentDidMount() {
        const { props } = this
        const { routes, requestRoutes } = props

        if( Object.keys( routes ).length <= 0 || stale() ) {
            requestRoutes()
        }
    }

    // renderRoute = ( k, i ) => {
    //     const { props } = this
    //     const { routes: origins } = props
    //     const originRoutes = origins[ k ]
    //     const route = originRoutes[ i ]
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

                // { Object.keys( routes ).map( k => routes[ k ] ).map( a => ( !!a.atd && !a.ata ) ? renderRouteFlying( a ) : renderRouteParked( a ) ) }
                // { Object.keys( routes ).map( k => routes[ k ] ).map( a => ( !!a.etd && !a.ata && a.destinationCode ) ? renderRouteFlying( a ) : renderRouteParked( a ) ) }
                // { routes.map( i => renderRoute( routes[ i ] ) ) }
        return (
            <React.Fragment key={i}>
                { originRoutes.map( r => renderRoute( k, r ) ) }
            </React.Fragment>
        )
    }

                // { originKeys.map( k => routes[ k ] ).map( a => renderOriginRoutes( a ) }
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
        // const { renderRoute, props } = this
        // const { routes: origins } = props
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
        requestRoutes: () => {
            dispatch( requestRoutes() )
        },
        deleteRoute: ( id ) => {
            dispatch( deleteRoute( id ) )
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Routes)
