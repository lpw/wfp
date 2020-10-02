import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'
import AppHeader from './AppHeader'
import FlightPlans from './FlightPlans'
import FlightPlan from './FlightPlan'
import AddFlightPlan from './AddFlightPlan'

function App( props ) {
    return (
        <div className="App">
            <AppHeader />
            <Switch location={props.location} >
                <Route path="/flight/:id" component={FlightPlan} />
                <Route path="/add" component={AddFlightPlan} />
                <Route component={FlightPlans} />
            </Switch>
        </div>
    )
}

export default App
