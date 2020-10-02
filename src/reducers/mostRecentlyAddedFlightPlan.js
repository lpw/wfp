// import assert from 'assert'

import {
	ADDED_FLIGHT_PLAN,
} from '../actions'

const mostRecentlyAddedFlightPlan = ( state = 0, action ) => {
	const { type } = action

	switch ( type ) {

		case ADDED_FLIGHT_PLAN: {
			const { flightPlanId } = action
			return flightPlanId
		}


		default:
			return state
	}
}

export default mostRecentlyAddedFlightPlan
