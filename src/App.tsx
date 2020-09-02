import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import './App.css'

import Home from './pages/Home'
import routes from './consts/routes'
import Player from './pages/Player/Player'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path={routes.home}>
          <Home />
        </Route>
        <Route path={routes.player}>
          <Player />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
