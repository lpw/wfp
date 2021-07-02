export const RECEIVED_FLIGHT_PLANS = 'RECEIVED_FLIGHT_PLANS'
export const RECEIVED_FLIGHT_PLAN = 'RECEIVED_FLIGHT_PLAN'
export const RECEIVED_ROUTES = 'RECEIVED_ROUTES'
export const RECEIVED_POINTS = 'RECEIVED_POINTS'
export const RECEIVED_USERS = 'RECEIVED_USERS'
export const LOGIN_USER = 'LOGIN_USER'
export const ADDED_FLIGHT_PLAN = 'ADDED_FLIGHT_PLAN'

export function receivedFlightPlans( flightPlans = [] ) {
    return {
        type: RECEIVED_FLIGHT_PLANS,
        flightPlans,
    }
}

export function receivedFlightPlan( flightPlan = {} ) {
    return {
        type: RECEIVED_FLIGHT_PLAN,
        flightPlan,
    }
}

export function receivedRoutes( routes = [] ) {
    return {
        type: RECEIVED_ROUTES,
        routes,
    }
}

export function receivedPoints( points = [] ) {
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

export function addedNewFlightPlan( flightPlanId ) {
    return {
        type: ADDED_FLIGHT_PLAN,
        flightPlanId,
    }
}
