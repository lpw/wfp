import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import flightPlans from './flightPlans'
import routes from './routes'
import points from './points'
import users from './users'
import userId from './userId'
import mostRecentlyAddedFlightPlan from './mostRecentlyAddedFlightPlan'

const reducers = {
	flightPlans,
	routes,
	points,
	users,
	userId,
	mostRecentlyAddedFlightPlan,
}

const createRootReducer = (history) => combineReducers({
  ...history && { router: connectRouter(history) },
  ...reducers
})

export default createRootReducer

