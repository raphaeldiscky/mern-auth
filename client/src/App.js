import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Register from './pages/Register'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/register' component={Register} />
      </Switch>
    </Router>
  )
}

export default App
