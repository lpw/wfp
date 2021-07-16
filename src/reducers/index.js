import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import flights from './flights'
import routes from './routes'
import points from './points'
import fleet from './fleet'
import users from './users'
import userId from './userId'
import mostRecentlyAddedFlight from './mostRecentlyAddedFlight'
import flyingAircraft from './flyingAircraft'

const reducers = {
	flights,
	routes,
	points,
	fleet,
	users,
	userId,
	mostRecentlyAddedFlight,
	flyingAircraft,
}

const createRootReducer = (history) => combineReducers({
  ...history && { router: connectRouter(history) },
  ...reducers
})

export default createRootReducer

