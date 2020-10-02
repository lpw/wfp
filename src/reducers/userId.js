import {
	LOGIN_USER,
} from '../actions'

const userId = ( state = 0, action ) => {
	const { type } = action

	switch ( type ) {

		case LOGIN_USER: {
			const { userId } = action

			return userId 
		}

		default:
			return state
	}
}

export default userId
