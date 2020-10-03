import {
	connectionQuery,
} from './connection';

const escape = s => s.replace( /\'/g, "\\'" )

export const usersQuery = f => connectionQuery( `select * from users`, f ) // need it all for the People page
export const typesQuery = f => connectionQuery( `select * from types`, f )
export const flightPlansQuery = f => connectionQuery( `SELECT id, name, author FROM flightplans`, f )
export const flightPlansPointCountQuery = f => connectionQuery( `SELECT id, COUNT(*) as pointCount FROM flightplans, flightplans_routes WHERE flightplans.id=flightplans_routes.flightplan GROUP BY flightplans.id`, f )
export const flightPlanQuery = ( id, f ) => connectionQuery( `SELECT * FROM flightplans WHERE id=${id}`, f )
export const routesAndPointsOfFlightPlanQuery = ( id, f ) => connectionQuery( `SELECT routes.*, points.*, routes_points.*, flightplans_routes.route FROM flightplans_routes, routes_points, routes, points WHERE flightplan=${id} AND routes_points.route=flightplans_routes.route AND routes.id=routes_points.route AND points.id=routes_points.point`, f )
export const flightPlansRoutesQuery = f => connectionQuery( `SELECT flightplans.id, flightplans.name, COUNT(distance) as count, SUM(distance) as sum FROM flightplans, flightplans_routes, routes where flightplans.id=flightplans_routes.flightplan and routes.id=flightplans_routes.route group by flightplans.id`, f )
export const routesInFlightPlanQuery = ( id, f ) => connectionQuery( `select routes.* from routes, flightplans_routes where flightplans_routes.flightplan=${id} and flightplans_routes.route=flightplans_routes.route`, f )
export const addRouteToRoutesQuery = ( description = '', altitude = 0, f ) => connectionQuery( `INSERT INTO routes (\`description\`, \`altitude\`) VALUES ('${escape(description)}', '${altitude}')`, f )
export const addRouteToFlightPlansQuery = ( flightPlanId, routeId, f ) => connectionQuery( `INSERT INTO flightplans_routes (\`flightplan\`, \`route\`) VALUES ('${flightPlanId}', ${routeId})`, f )
export const addFlightPlanQueryText = ( name, userId = '', f ) => `INSERT INTO \`flightplans\` (\`name\`, \`author\`) VALUES ('${escape(name)}', '${userId}')`
export const addFlightPlanQuery = ( name, userId, f ) => connectionQuery( addFlightPlanQueryText( name, userId ), f )
export const getLastInsertIdQuery = ( f ) => connectionQuery( `SELECT LAST_INSERT_ID() as id`, f )
export const addPointToPointsQuery = ( name, type = 1, lat = 0, lon = 0, elevation = 0, f ) => connectionQuery( `INSERT INTO points (\`name\`, \`type\`, \`lat\`, \`lon\`, \`elevation\`) VALUES ('${escape(name)}', '${type}', '${lat}', '${lon}', '${elevation}'); SELECT LAST_INSERT_ID() as id`, f )
export const addPointToRouteQuery = ( routeId, pointId, f ) => connectionQuery( `INSERT INTO routes_points (\`route\`, \`point\`) VALUES ('${routeId}', ${pointId})`, f )
export const pointTypesQuery = f => connectionQuery( `SELECT * from point_types`, f )
export const deleteFlightPlanQuery = ( id, f ) => connectionQuery( `DELETE FROM flightplans_routes where flightplan=${id}; DELETE FROM flightplans where id=${id}`, f )
// export const deleteRouteQuery = ( id, f ) => connectionQuery( `DELETE FROM flightplans where id=${id}`, f )
