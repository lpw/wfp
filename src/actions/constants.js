export const RECEIVED_FLIGHTS = 'RECEIVED_FLIGHTS'
export const RECEIVED_FLIGHT = 'RECEIVED_FLIGHT'
export const RECEIVED_ROUTES = 'RECEIVED_ROUTES'
export const RECEIVED_POINTS = 'RECEIVED_POINTS'
export const RECEIVED_POINT = 'RECEIVED_POINT'
export const RECEIVED_FLEET = 'RECEIVED_FLEET'
export const RECEIVED_USERS = 'RECEIVED_USERS'
export const LOGIN_USER = 'LOGIN_USER'
export const ADDED_FLIGHT = 'ADDED_FLIGHT'
export const ADDED_AIRCRAFT = 'ADDED_AIRCRAFT'
export const DELETED_AIRCRAFT = 'DELETED_AIRCRAFT'
export const FLY_AIRCRAFT = 'FLY_AIRCRAFT'
export const UPDATE_TELEMETRY = 'UPDATE_TELEMETRY'

export function receivedFlights( flights = [] ) {
    return {
        type: RECEIVED_FLIGHTS,
        flights,
    }
}

export function receivedFlight( flight = {} ) {
    return {
        type: RECEIVED_FLIGHT,
        flight,
    }
}

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

export function receivedUsers( users = [] ) {
    return {
        type: RECEIVED_USERS,
        users,
    }
}

export function loginUser( userId = '' ) {
    return {
        type: LOGIN_USER,
        userId,
    }
}

export function addedFlight( flightId ) {
    return {
        type: ADDED_FLIGHT,
        flightId,
    }
}

export function receivedFleet( fleet = [] ) {
    return {
        type: RECEIVED_FLEET,
        fleet,
    }
}

export function addedAircraft( aircraftId, aircraftName, pointId ) {
    return {
        type: ADDED_AIRCRAFT,
        aircraftId,
        aircraftName,
        pointId,
    }
}

export function deletedAircraft( aircraftId ) {
    return {
        type: DELETED_AIRCRAFT,
        aircraftId,
    }
}

export function flyAircraft( aircraftId ) {
    return {
        type: FLY_AIRCRAFT,
        aircraftId,
    }
}

export function updateTelemetry( telemetry, time ) {
    return {
        type: UPDATE_TELEMETRY,
        telemetry,
        time,
    }
}

