import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import routes from './routes'
import points from './points'
import fleet from './fleet'
// import users from './users'
// import userId from './userId'

const reducers = {
	routes,
	points,
	fleet,
	// users,
	// userId,
}

const createRootReducer = (history) => combineReducers({
  ...history && { router: connectRouter(history) },
  ...reducers
})

export default createRootReducer

