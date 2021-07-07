import {
	RECEIVED_POINTS,
	RECEIVED_POINT,
} from '../actions'

const points = ( state = {}, action ) => {
	const { type } = action

	switch ( type ) {

		case RECEIVED_POINTS: {
			const { points } = action
			return points
		}

		// case RECEIVED_POINTS: {
		// 	const { points } = action

		// 	return {
		// 		...state,
		// 		...points.reduce( ( pointCollection, point ) => {
		// 			const code = point.code.toUpperCase()
		// 			const shortCode = code[ 0 ] === 'K' ? code.substr( 1 ).toUpperCase() : code

		// 			return {
		// 				...pointCollection,
		// 				[ point.id ]: {
		// 					...state[ point.id ],
		// 					...point
		// 				},
		// 				[ code ]: {
		// 					...state[ code ],
		// 					...point
		// 				},
		// 				[ shortCode ]: {
		// 					...state[ shortCode ],
		// 					...point
		// 				}
		// 			}
		// 		}, {} )
		// 	}
		// }

		// case RECEIVED_POINT: {
		// 	const { point } = action
		// 	const code = point.code.toUpperCase()
		// 	const shortCode = code[ 0 ] === 'K' ? code.substr( 1 ).toUpperCase() : code

		// 	return {
		// 		...state,
		// 		[ point.id ]: {
		// 			...state[ point.id ],
		// 			...point
		// 		},
		// 		[ code ]: {
		// 			...state[ code ],
		// 			...point
		// 		},
		// 		[ shortCode ]: {
		// 			...state[ shortCode ],
		// 			...point
		// 		}
		// 	}
		// }

		default:
			return state
	}
}

export default points
