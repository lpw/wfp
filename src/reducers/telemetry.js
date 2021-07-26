// import assert from 'assert'

import {
	UPDATE_TELEMETRY,
} from '../actions'

const telemetry = ( state = {}, action ) => {
	const { type } = action

	switch ( type ) {

		case UPDATE_TELEMETRY: {
			const { telemetry } = action
			return {
				...state,
				[ telemetry.id ]: {
					...state[ telemetry.id ],
					...telemetry
				}
			}
		}

		default:
			return state
	}
}

export default telemetry
