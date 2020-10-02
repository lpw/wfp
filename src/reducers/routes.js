import {
	RECEIVED_ROUTES,
} from '../actions'

const routes = ( state = {}, action ) => {
	const { type } = action

	switch ( type ) {

		case RECEIVED_ROUTES: {
			const { routes } = action
			return {
				...state,
				...routes,
			}
		}

		default:
			return state
	}
}

export default routes
