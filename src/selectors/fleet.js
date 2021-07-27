// export const aircraftNameFromId = ( state, aircraftId ) => {
// 	const aircraft = state.fleet.find( a => a.id === +aircraftId )
// 	return aircraft ? aircraft.name : ''
// }

// export const fleetFromState = ( state ) => {
// 	return state.fleet
// }

export const aircraftDataFromId = ( state, id ) => {
    const { fleet, telemetry } = state
    const aircraftTelemetry = telemetry[ id ]
    const aircrraftFleet = fleet[ id ]
    const aircraftData = { 
        ...aircrraftFleet,
        ...aircraftTelemetry,
    }
    return aircraftData
}

export const fleetData = ( state ) => {
    const { fleet } = state
    const fd = Object.keys( fleet ).map( k => fleet[ k ]).reduce( ( fd, aircraft )=> {
    	const { id } = aircraft
    	return {
    		...fd,
    		[ id ]: aircraftDataFromId( state, id )
    	}
    }, {} )
    return fd 
}