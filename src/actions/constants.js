export const RECEIVED_ROUTES = 'RECEIVED_ROUTES'
export const RECEIVED_POINTS = 'RECEIVED_POINTS'
export const RECEIVED_FLEET = 'RECEIVED_FLEET'
export const UPDATE_TELEMETRY = 'UPDATE_TELEMETRY'
// export const RECEIVED_USERS = 'RECEIVED_USERS'
// export const LOGIN_USER = 'LOGIN_USER'
// export const ADDED_AIRCRAFT = 'ADDED_AIRCRAFT'
// export const DELETED_AIRCRAFT = 'DELETED_AIRCRAFT'

export function receivedRoutes( routes = {} ) {
    return {
        type: RECEIVED_ROUTES,
        routes,
    }
}

export function receivedPoints( points = {} ) {
    return {
        type: RECEIVED_POINTS,
        points,
    }
}

export function receivedFleet( fleet = [] ) {
    return {
        type: RECEIVED_FLEET,
        fleet,
    }
}

export function updateTelemetry( telemetry, time ) {
    return {
        type: UPDATE_TELEMETRY,
        telemetry,
        time,
    }
}

// export function addedAircraft( aircraftId, aircraftName, pointId ) {
//     return {
//         type: ADDED_AIRCRAFT,
//         aircraftId,
//         aircraftName,
//         pointId,
//     }
// }

// export function deletedAircraft( aircraftId ) {
//     return {
//         type: DELETED_AIRCRAFT,
//         aircraftId,
//     }
// }

// export function flyAircraft( aircraftId ) {
//     return {
//         type: FLY_AIRCRAFT,
//         aircraftId,
//     }
// }

// export function receivedUsers( users = [] ) {
//     return {
//         type: RECEIVED_USERS,
//         users,
//     }
// }

// export function loginUser( userId = '' ) {
//     return {
//         type: LOGIN_USER,
//         userId,
//     }
// }

