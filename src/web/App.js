import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'
// import AppHeader from './AppHeader'
import Fleet from './Fleet'
// import Flights from './Flights'
import Flight from './Flight'
import AddFlight from './AddFlight'

function App( props ) {
            // <AppHeader />
    return (
        <div className="App">
            <Switch location={props.location} >
                <Route path="/fleet" component={Fleet} />
                <Route path="/flight/:id" component={Flight} />
                <Route path="/add" component={AddFlight} />
                <Route component={Fleet} />
            </Switch>
        </div>
    )
}

export default App
