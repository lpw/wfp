// import assert from 'assert'

import {
	UPDATE_TELEMETRY,
} from '../actions'

const telemetry = ( state = {}, action ) => {
	const { type } = action

	switch ( type ) {

		case UPDATE_TELEMETRY: {
			const { telemetry, time: telemetryTime } = action
			return {
				...state,
				[ telemetry.id ]: {
					...state[ telemetry.id ],
					...telemetry,
					telemetryTime
				}
			}
		}

		default:
			return state
	}
}

export default telemetry
