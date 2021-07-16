import {
	FLY_AIRCRAFT,
} from '../actions'

const flyingAircraft = ( state = 0, action ) => {
	const { type } = action

	switch ( type ) {

		case FLY_AIRCRAFT: {
			const { aircraftId } = action

			return aircraftId 
		}

		default:
			return state
	}
}

export default flyingAircraft
