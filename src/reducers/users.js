import {
	RECEIVED_USERS,
} from '../actions'

const users = ( state = [], action ) => {
	const { type } = action

	switch ( type ) {

		case RECEIVED_USERS: {
			const { users } = action

			return users 
		}

		default:
			return state
	}
}

export default users
