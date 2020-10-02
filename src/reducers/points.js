import {
	RECEIVED_POINTS,
} from '../actions'

const points = ( state = {}, action ) => {
	const { type } = action

	switch ( type ) {

		case RECEIVED_POINTS: {
			const { points } = action
			return {
				...state,
				...points
			}
		}

		default:
			return state
	}
}

export default points
