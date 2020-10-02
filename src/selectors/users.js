export const userNameFromId = ( state, userId ) => {
	const user = state.users.find( r => r.id === +userId )

	return user ? user.name : ''
}

export const usersFromState = ( state ) => {
	return state.users
}