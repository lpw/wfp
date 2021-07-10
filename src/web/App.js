import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'
// import AppHeader from './AppHeader'
import Fleet from './Fleet'
// import Flights from './Flights'
// import Flight from './Flight'
import Supervise from './Supervise'
// import AddFlight from './AddFlight'

function App( props ) {
            // <AppHeader />
                // <Route path="/add" component={AddFlight} />
                // <Route path="/supervise/:id" component={Supervise} />
    return (
        <div className="App">
            <Switch location={props.location} >
                <Route path="/fleet" component={Fleet} />
                <Route path="/flms" component={Fleet} />
                <Route path="/fms" component={Fleet} />
                <Route path="/foc" component={Fleet} />
                <Route path="/gs" component={Fleet} />
                <Route path="/supervise" component={Supervise} />
                <Route path="/supervisor" component={Supervise} />
                <Route path="/mvs" component={Supervise} />
                <Route component={Fleet} />
            </Switch>
        </div>
    )
}

export default App
