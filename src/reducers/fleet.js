import {
	RECEIVED_FLEET,
	ADDED_AIRCRAFT,
	DELETED_AIRCRAFT,
} from '../actions'

const fleet = ( state = [], action ) => {
	const { type } = action

	switch ( type ) {

		case RECEIVED_FLEET: {
			const { fleet } = action

			return fleet 
		}

		case ADDED_AIRCRAFT: {
			const { aircraftId, aircraftName, pointId } = action

			return state.concat({ 
				id: aircraftId,
				name: aircraftName,
				base: pointId,
			})
		}

		case DELETED_AIRCRAFT: {
			const { aircraftId } = action

			return state.filter( f => f.id !== aircraftId )
		}

		default:
			return state
	}
}

export default fleet
