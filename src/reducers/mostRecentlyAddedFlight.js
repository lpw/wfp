// import assert from 'assert'

import {
	ADDED_FLIGHT,
} from '../actions'

const mostRecentlyAddedFlight = ( state = 0, action ) => {
	const { type } = action

	switch ( type ) {

		case ADDED_FLIGHT: {
			const { flightId } = action
			return flightId
		}


		default:
			return state
	}
}

export default mostRecentlyAddedFlight
