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
        ...aircraftTelemetry,
        ...aircrraftFleet,
    }
    return aircraftData
}
