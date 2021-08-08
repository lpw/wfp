import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'
// import AppHeader from './AppHeader'
import Footer from './Footer'
import Fleet from './Fleet'
import Supervise from './Supervise'
import Add from './Add'
import Routes from './Routes'

// Currentl FLMS, MVS, stub planes are routes but will ultimately be separate processes (will share database)

function App( props ) {
            // <AppHeader />
    return (
        <div className="App">
            <Switch location={props.location} >
                <Route path="/routes" component={Routes} />
                <Route path="/fleet" component={Fleet} />
                <Route path="/flms" component={Fleet} />
                <Route path="/fms" component={Fleet} />
                <Route path="/foc" component={Fleet} />
                <Route path="/gas" component={Add} />
                <Route path="/gs" component={Add} />
                <Route path="/supervise" component={Supervise} />
                <Route path="/supervisor" component={Supervise} />
                <Route path="/mvs" component={Supervise} />
                <Route path="/aircraft" component={Add} />
                <Route path="/flight" component={Add} />
                <Route component={Add} />
            </Switch>
            <Footer />
        </div>
    )
}

export default App
