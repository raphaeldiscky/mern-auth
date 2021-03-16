import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Register from './pages/Register'
import Home from './pages/Home'
import Activate from './pages/Activate'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/register' component={Register} />
        <Route exact path='/users/activate/:token' component={Activate} />
      </Switch>
    </Router>
  )
}

export default App
