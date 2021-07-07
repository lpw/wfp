// import assert from 'assert'

import {
	RECEIVED_FLIGHTS,
	RECEIVED_FLIGHT,
} from '../actions'

const flights = ( state = {}, action ) => {
	const { type } = action

	switch ( type ) {

		case RECEIVED_FLIGHTS: {
			const { flights } = action
			return {
				...state,
				...flights.reduce( ( flightCollection, flight ) => ({
					...flightCollection,
					[ flight.id ]: {
						...state[ flight.id ],
						...flight
					}
				}), {} )
			}
		}

		case RECEIVED_FLIGHT: {
			const { flight } = action

			return {
				...state,
				[ flight.id ]: {
					...state[ flight.id ],
					...flight
				}
			}
		}


		default:
			return state
	}
}

export default flights
