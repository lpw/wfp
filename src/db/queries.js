import {
	connectionQuery,
} from './connection';

const escape = s => s.replace( /\'/g, "\\'" )

export const usersQuery = f => connectionQuery( `select * from users`, f ) // need it all for the People page
export const aircraftQuery = f => connectionQuery( `select * from aircraft`, f )
export const typesQuery = f => connectionQuery( `select * from types`, f )
// export const flightsQuery = f => connectionQuery( `SELECT id, aircraft FROM flights`, f )
// export const flightsQuery = f => connectionQuery( `SELECT * FROM flights`, f )
// export const flightsQuery = f => connectionQuery( `SELECT flights.id, aircraft.name as aircraft FROM flights, flights_routes, routes, routes_points WHERE flights.id=flights_routes.flight AND flights_routes.route=routes_points.route AND routes_points.route=routes.id GROUP BY flights.id`, f )
// export const flightsPointCountQuery = f => connectionQuery( `SELECT flights.id, COUNT(*) as pointCount FROM flights, flights_routes, routes, routes_points WHERE flights.id=flights_routes.flight AND flights_routes.route=routes_points.route AND routes_points.route=routes.id GROUP BY flights.id`, f )
export const flightQuery = ( id, f ) => connectionQuery( `SELECT * FROM flights WHERE id=${id}`, f )
export const routesAndPointsOfFlightQuery = ( id, f ) => connectionQuery( `SELECT routes.*, points.*, routes_points.*, flights_routes.route FROM flights_routes, routes_points, routes, points WHERE flight=${id} AND routes_points.route=flights_routes.route AND routes.id=routes_points.route AND points.id=routes_points.point`, f )
export const flightsRoutesQuery = f => connectionQuery( `SELECT flights.id, flights.name, COUNT(distance) as count, SUM(distance) as sum FROM flights, flights_routes, routes where flights.id=flights_routes.flight and routes.id=flights_routes.route group by flights.id`, f )
export const routesInFlightQuery = ( id, f ) => connectionQuery( `select routes.* from routes, flights_routes where flights_routes.flight=${id} and flights_routes.route=flights_routes.route`, f )
// export const addRouteToRoutesQuery = ( path = '', altitude = 0, speed = 0, f ) => connectionQuery( `INSERT INTO routes (\`path\`, \`altitude\`, \`speed\`) VALUES ('${escape(path)}', '${altitude}', '${speed}')`, f )
// export const addRouteToFlightsQuery = ( flightId, routeId, f ) => connectionQuery( `INSERT INTO flights_routes (\`flight\`, \`route\`) VALUES ('${flightId}', ${routeId})`, f )
// export const addFlightQueryText = ( aircraftId = '', f ) => `INSERT INTO \`flights\` (\`aircraft\`) VALUES ('${aircraftId}')`
// export const addFlightQuery = ( aircraftId, f ) => connectionQuery( addFlightQueryText( aircraftId ), f )
export const getLastInsertIdQuery = ( f ) => connectionQuery( `SELECT LAST_INSERT_ID() as id`, f )
export const addPointToPointsQuery = ( name, code, type = 1, lat = 0, lon = 0, elevation = 0, f ) => connectionQuery( `INSERT INTO points (\`name\`, \`code\`, \`type\`, \`lat\`, \`lon\`, \`elevation\`) VALUES ('${escape(name)}', '${escape(code)}', '${type}', '${lat}', '${lon}', '${elevation}'); SELECT LAST_INSERT_ID() as id`, f )
// export const addPointToRouteQuery = ( routeId, pointId, f ) => connectionQuery( `INSERT INTO routes_points (\`route\`, \`point\`) VALUES ('${routeId}', ${pointId})`, f )
export const pointTypesQuery = f => connectionQuery( `SELECT * from pointtypes`, f )
export const deleteFlightQuery = ( id, f ) => connectionQuery( `DELETE FROM flights_routes where flight=${id}; DELETE FROM flights where id=${id}`, f )
// export const deleteRouteQuery = ( id, f ) => connectionQuery( `DELETE FROM flights where id=${id}`, f )
// export const fleetQuery = () => connectionQuery( `select fleet.id, fleet.name, points.name as base, routes.path, routes.altitude, routes.speed from fleet, fleet_points, fleet_routes, points, routes where fleet_points.aircraft=fleet.id and fleet_routes.aircraft=fleet.id and points.id=fleet_points.point and routes.id=fleet_routes.route` )

// fleet.id, fleet.name, points.code as base, routes.path, routes_points.*, routes.altitude, routes.speed 
// LEFT OUTER JOIN 
// routes_points 
// ON 
// routes_points.route=routes.id
// export const fleetQuery = f => connectionQuery( `
// SELECT 
// fleet.id, fleet.name, points.code as base, routes.path, routes.altitude, routes.speed 
// FROM 
// fleet 
// LEFT OUTER JOIN 
// fleet_points 
// ON 
// fleet_points.aircraft=fleet.id
// LEFT OUTER JOIN 
// points points
// ON points.id=fleet_points.point 
// LEFT OUTER JOIN 
// fleet_routes
// ON
// fleet_routes.aircraft=fleet.id 
// LEFT OUTER JOIN 
// routes 
// ON 
// routes.id=fleet_routes.route
// `, f )

// export const fleetQuery = f => connectionQuery( `
// 	SELECT 
// 	fleet.id, fleet.name, fleet_points.point as base, fleet_routes.route, routes.path, routes.origin, routes.destination, routes.altitude, routes.speed 
// 	FROM 
// 	fleet 
// 	LEFT OUTER JOIN 
// 	fleet_points 
// 	ON 
// 	fleet_points.aircraft=fleet.id
// 	LEFT OUTER JOIN 
// 	fleet_routes
// 	ON
// 	fleet_routes.aircraft=fleet.id 
// 	LEFT OUTER JOIN 
// 	routes 
// 	ON 
// 	routes.id=fleet_routes.route
// `, f )

	// WHERE flights.atd IS NOT NULL AND flights.ata IS NULL
	// ORDER BY routes_points.sequence
	// WHERE flights.id IS NULL OR flights.atd IS NOT NULL AND flights.ata IS NULL
	// WHERE flights.id IS NULL OR flights.ata IS NULL
	// points.lat, points.lon,
	// points.code,
	// points.lat,
	// points.lon
// export const fleetQuery = f => connectionQuery( `
// 	SELECT 
// 		fleet.id, fleet.name, fleet.base as baseId, fleet.lat, fleet.lon,
// 		flights.id as flightId,
// 		flights.altitude, flights.speed,
// 		UNIX_TIMESTAMP( flights.etd ), UNIX_TIMESTAMP( flights.eta ),
// 		UNIX_TIMESTAMP( flights.atd ), UNIX_TIMESTAMP( flights.ata ),
// 		routes.id as routeId, 
// 		routes_points.sequence,
// 		routes.altitude, routes.speed,
// 		points.id as pointId
// 	FROM 
// 		fleet 
// 	LEFT OUTER JOIN 
// 		flights 
// 	ON 
// 		flights.aircraft=fleet.id
// 	LEFT OUTER JOIN 
// 		routes
// 	ON
// 		routes.id=flights.route
// 	LEFT OUTER JOIN 
// 		routes_points
// 	ON 
// 		routes_points.route=routes.id
// 	LEFT OUTER JOIN 
// 		points
// 	ON 
// 		points.id=routes_points.point
// 	ORDER BY flights.ata DESC, routes_points.sequence ASC
// `, f )

// export const readyFleetQuery = f => connectionQuery( `
// 	SELECT 
// 		fleet.id, fleet.name, fleet.base as baseId, fleet.lat, fleet.lon,
// 		flights.id as flightId,
// 		flights.altitude, flights.speed,
// 		UNIX_TIMESTAMP( flights.etd ), UNIX_TIMESTAMP( flights.eta ),
// 		UNIX_TIMESTAMP( flights.atd ), UNIX_TIMESTAMP( flights.ata ),
// 		routes.id as routeId, 
// 		routes_points.sequence,
// 		routes.altitude, routes.speed,
// 		points.id as pointId
// 	FROM 
// 		fleet 
// 	LEFT OUTER JOIN 
// 		flights 
// 	ON 
// 		flights.aircraft=fleet.id
// 	LEFT OUTER JOIN 
// 		routes
// 	ON
// 		routes.id=flights.route
// 	LEFT OUTER JOIN 
// 		routes_points
// 	ON 
// 		routes_points.route=routes.id
// 	LEFT OUTER JOIN 
// 		points
// 	ON 
// 		points.id=routes_points.point
// 	WHERE flights.atd IS NULL AND flights.ata IS NULL
// 	ORDER BY flights.ata DESC, routes_points.sequence ASC
// `, f )

// export const flyingFleetQuery = f => connectionQuery( `
// 	SELECT 
// 		fleet.id, fleet.name, fleet.base as baseId, fleet.lat, fleet.lon,
// 		flights.id as flightId,
// 		flights.altitude, flights.speed,
// 		UNIX_TIMESTAMP( flights.etd ), UNIX_TIMESTAMP( flights.eta ),
// 		UNIX_TIMESTAMP( flights.atd ), UNIX_TIMESTAMP( flights.ata ),
// 		routes.id as routeId, 
// 		routes_points.sequence,
// 		routes.altitude, routes.speed,
// 		points.id as pointId
// 	FROM 
// 		fleet 
// 	LEFT OUTER JOIN 
// 		flights 
// 	ON 
// 		flights.aircraft=fleet.id
// 	LEFT OUTER JOIN 
// 		routes
// 	ON
// 		routes.id=flights.route
// 	LEFT OUTER JOIN 
// 		routes_points
// 	ON 
// 		routes_points.route=routes.id
// 	LEFT OUTER JOIN 
// 		points
// 	ON 
// 		points.id=routes_points.point
// 	WHERE flights.atd IS NOT NULL AND flights.ata IS NULL
// 	ORDER BY flights.ata DESC, routes_points.sequence ASC
// `, f )
		// fleet.speed as aircraftSpeed, 
		// fleet.altitude as aircraftAltitude, 
const fleetQueryText = ( where = '' ) => `
	SELECT 
		fleet.id, 
		fleet.name, 
		fleet.base as baseId, 
		fleet.lat, 
		fleet.lon,
		fleet.charge, 
		fleet.heading, 
		fleet.speed, 
		fleet.altitude, 
		fleet.pitch, 
		fleet.yaw, 
		fleet.roll, 
		fleet.turn, 
		fleet.vsi, 
		fleet.timestamp, 
		flights.id as flightId,
		flights.altitude as flightAltitude,
		flights.speed as flightSpeed,
		UNIX_TIMESTAMP( flights.etd ) as etd, 
		UNIX_TIMESTAMP( flights.eta ) as eta,
		UNIX_TIMESTAMP( flights.atd ) as atd, 
		UNIX_TIMESTAMP( flights.ata ) as ata,
		flights.elapsed,
		flights.covered,
		routes.id as routeId, 
		routes.distance, 
		routes.bearing as heading, 
		routes_points.sequence,
		routes.altitude as routeAltitude,
		routes.speed as routeSpeed,
		points.id as pointId
	FROM 
		fleet 
	LEFT OUTER JOIN 
		flights 
	ON 
		flights.aircraft=fleet.id
	LEFT OUTER JOIN 
		routes
	ON
		routes.id=flights.route
	LEFT OUTER JOIN 
		routes_points
	ON 
		routes_points.route=routes.id
	LEFT OUTER JOIN 
		points
	ON 
		points.id=routes_points.point
	${where}
	ORDER BY 
		flights.ata DESC, routes_points.sequence ASC
`

export const fleetQuery = f => connectionQuery( fleetQueryText(), f )
export const launchingFlightQuery = f => connectionQuery( fleetQueryText( 'WHERE flights.atd IS NULL AND flights.ata IS NULL AND flights.etd < NOW()' ), f )
export const flyingFleetQuery = f => connectionQuery( fleetQueryText( 'WHERE flights.atd IS NOT NULL AND flights.ata IS NULL' ), f )

export const pointsQuery = ( f ) => connectionQuery( `
	SELECT 
		* 
	FROM 
		points 
`, f )

export const routeQuery = ( routeId, f ) => connectionQuery( `
	SELECT 
		* 
	FROM 
		routes
	WHERE 
		id=${routeId}
`, f )

export const routePointsQuery = ( routeId, f ) => connectionQuery( `
	SELECT 
		* 
	FROM 
		routes_points 
	WHERE 
		routes_points.route=${routeId}
`, f )

export const pointQuery = ( pointId, f ) => connectionQuery( `
	SELECT 
		* 
	FROM 
		points
	WHERE 
		id=${pointId}
`, f )

export const addAircraftQuery =  ( aircraftName, pointId, f ) => connectionQuery( `
	INSERT INTO 
		\`fleet\`
		(\`name\`, \'base\')
	VALUES 
		('${aircraftName}', ${pointId})
`, f )

export const addFleetPointQuery = ( aircraftId, pointId, f ) => connectionQuery( `
	INSERT INTO 
		\`fleet_points\`
		(\`aircraft\`, \`point\`)
	VALUES 
		('${aircraftId}', '${pointId}')
`, f )

export const addRouteQuery = ( origin, destination, altitude, speed, f ) => connectionQuery( `
	INSERT INTO 
		\`routes\`
		(\`origin\`, \`destination\`, \`altitude\`, \`speed\`)
	VALUES 
		('${origin}', '${destination}', '${altitude}', '${speed}')
`, f )

export const addRouteToAircraft = ( aircraft, route, f ) => connectionQuery( `
	DELETE FROM fleet_routes where aircraft=${aircraft};
	INSERT INTO 
		\`fleet_routes\`
		(\`aircraft\`, \`route\`)
	VALUES 
		('${aircraft}', '${route}')
`, f )

export const deleteAircraftQuery = ( id, f ) => connectionQuery( `
	DELETE FROM fleet where id=${id}; 
	DELETE FROM flights where aircraft=${id}; 
`, f )

// export const addFlightQuery = ( aircraftId, routeId, altitude, speed, f ) => connectionQuery( `
// 	INSERT INTO 
// 		\`flights\`
// 		(\`aircraft\`, \`route\`, \`altitude\`, \`speed\`, \`etd\`)
// 	VALUES 
// 		('${aircraftId}', '${routeId}', '${altitude}', '${speed}', NOW())
// `, f )

export const addFlightQuery = ( aircraftId, routeId, f ) => connectionQuery( `
	INSERT INTO 
		\`flights\`
		(\`aircraft\`, \`route\`, \`etd\`)
	VALUES 
		('${aircraftId}', '${routeId}', NOW())
`, f )

export const addPointToRouteQuery = ( routeId, sequence, pointId, altitude, speed, f ) => connectionQuery( `
	INSERT INTO 
		\`routes_points\`
		(\`route\`, \`sequence\`, \`point\`, \`altitude\`, \`speed\`)
	VALUES 
		('${routeId}', '${sequence}', '${pointId}', '${altitude}', '${speed}')
`, f )

export const launchFlightQuery = ( flightId, atd, f ) => connectionQuery( `
	UPDATE 
		\`flights\`
	SET 
		\`atd\`
	= 
		FROM_UNIXTIME(${ atd })
	WHERE
		id 
	=
		${flightId}
`, f )

export const launchFlightNowQuery = ( flightId, f ) => connectionQuery( `
	UPDATE 
		\`flights\`
	SET 
		\`atd\`
	= 
		NOW()
	WHERE
		id 
	=
		${flightId}
`, f )

export const landFlightQuery = ( flightId, ata, f ) => connectionQuery( `
	UPDATE 
		\`flights\`
	SET 
		\`ata\`
	= 
		FROM_UNIXTIME(${ ata })
	WHERE
		id 
	=
		${flightId}
`, f )

export const landFlightNowQuery = ( flightId, f ) => connectionQuery( `
	UPDATE 
		\`flights\`
	SET 
		\`ata\`
	= 
		NOW()
	WHERE
		id 
	=
		${flightId}
`, f )

export const flightsQuery = f => connectionQuery( `
	SELECT 
		id, aircraft, route, altitude, speed,
		UNIX_TIMESTAMP( etd ) as etd, UNIX_TIMESTAMP( eta ) as eta,
		UNIX_TIMESTAMP( atd ) as atd, UNIX_TIMESTAMP( ata ) as ata
	FROM
		flights
`, f )

export const updateFlightQuery = ( flightId, eta, elapsed, coveredDistance, f ) => connectionQuery( `
	UPDATE 
		\`flights\`
	SET 
		\`eta\`
	= 
		FROM_UNIXTIME(${ eta }),
		\`elapsed\`
	= 
		${ Math.round( elapsed ) },
		\`covered\`
	= 
		${ Math.round( coveredDistance ) }
	WHERE
		id 
	=
		${flightId}
`, f )

export const updateRouteDistanceQuery = ( routeId, distance, f ) => connectionQuery( `
	UPDATE 
		\`routes\`
	SET 
		\`distance\`
	= 
		${ Math.round( distance ) }
	WHERE
		id 
	=
		${routeId}
`, f )

export const updateRouteBearingQuery = ( routeId, bearing, f ) => connectionQuery( `
	UPDATE 
		\`routes\`
	SET 
		\`bearing\`
	= 
		${ Math.round( bearing ) }
	WHERE
		id 
	=
		${routeId}
`, f )

export const updateAircraftQuery = ( id, lat, lon, heading, speed, altitude, pitch, yaw, roll, turn, vsi, charge, f ) => connectionQuery( `
	UPDATE 
		fleet
	SET 
		charge=${ Math.round( charge ) },
		lat=${ lat },
		lon=${ lon },
		heading=${ Math.round( heading ) },
		speed=${ Math.round( speed ) },
		altitude=${ Math.round( altitude ) },
		pitch=${ Math.round( pitch ) },
		yaw=${ Math.round( yaw ) },
		roll=${ Math.round( roll ) },
		turn=${ Math.round( turn ) },
		vsi=${ Math.round( vsi ) }
	WHERE
		id=${id}
`, f )

// export const getLaunchInfoFlightQuery = ( flightId, f ) => connectionQuery( `
// 	SELECT 
// 		aircraft, points.lat, points.lon, bearing, flights.speed, flights.altitude
// 	FROM
// 		flights, routes, points
// 	WHERE
// 		flights.id=${flightId} 
// 	AND
// 		routes.id=flights.route 
// 	AND
// 		points.id=routes.origin 
// `, f )

// export const getLandInfoFlightQuery = ( flightId, f ) => connectionQuery( `
// 	SELECT 
// 		aircraft, points.lat, points.lon, elevation
// 	FROM
// 		flights, routes, points
// 	WHERE
// 		flights.id=${flightId} 
// 	AND
// 		routes.id=flights.route 
// 	AND
// 		points.id=routes.destination 
// `, f )

// export const updateAircraftLandQuery = ( aircraftId, lat, lon, elevation, f ) => connectionQuery( `
// 	UPDATE 
// 		fleet
// 	SET 
// 		altitude=${ Math.round( elevation ) },
// 		lat=${ lat },
// 		lon=${ lon },
// 		speed=${ 0 }
// 	WHERE
// 		id=${aircraftId}
// `, f )

// export const routesQuery = ( f ) => connectionQuery( `
// 	SELECT 
// 		routes.*, points.code as destinationCode
// 	FROM
// 		routes, points
// 	WHERE
// 		points.id=routes.destination 
// `, f )

export const routesQuery = ( f ) => connectionQuery( `
	SELECT 
		routes.*, points.id as pointId, points.code as pointCode, sequence
	FROM
		routes, routes_points, points
	WHERE
		routes.id=routes_points.route 
	AND
		points.id=routes_points.point
	ORDER BY sequence
`, f )

export const updateLandingAircraftQuery = ( aircraftId, lat, lon, elevation, f ) => connectionQuery( `
	UPDATE 
		fleet
	SET 
		altitude=${ Math.round( elevation ) },
		lat=${ lat },
		lon=${ lon },
		speed=${ 0 }
	WHERE
		id=${aircraftId}
`, f )


