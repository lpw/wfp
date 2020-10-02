// import assert from 'assert'

import {
	RECEIVED_FLIGHT_PLANS,
	RECEIVED_FLIGHT_PLAN,
} from '../actions'

const flightPlans = ( state = {}, action ) => {
	const { type } = action

	switch ( type ) {

		case RECEIVED_FLIGHT_PLANS: {
			const { flightPlans } = action
			return {
				...state,
				...flightPlans.reduce( ( flightPlanCollection, flightPlan ) => ({
					...flightPlanCollection,
					[ flightPlan.id ]: {
						...state[ flightPlan.id ],
						...flightPlan
					}
				}), {} )
			}
		}

		case RECEIVED_FLIGHT_PLAN: {
			const { flightPlan } = action

			return {
				...state,
				[ flightPlan.id ]: {
					...state[ flightPlan.id ],
					...flightPlan
				}
			}
		}


		default:
			return state
	}
}

export default flightPlans
