import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Register from './pages/Register'
import Home from './pages/Home'
import Activate from './pages/Activate'
import Login from './pages/Login'
import ForgetPassword from './pages/ForgetPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/register' component={Register} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/users/password/forget' component={ForgetPassword} />
        <Route exact path='/users/activate/:token' component={Activate} />
        <Route
          exact
          path='/users/password/reset/:token'
          component={ResetPassword}
        />
      </Switch>
    </Router>
  )
}

export default App
