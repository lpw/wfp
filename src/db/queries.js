import {
	connectionQuery,
} from './connection';

const escape = s => s.replace( /\'/g, "\\'" )

export const getLastInsertIdQuery = ( f ) => connectionQuery( `SELECT LAST_INSERT_ID() as id`, f )

export const addPointToPointsQuery = ( name, code, type = 1, lat = 0, lon = 0, elevation = 0, f ) => connectionQuery( `
	INSERT INTO 
		points 
		(\`name\`, \`code\`, \`type\`, \`lat\`, \`lon\`, \`elevation\`) 
	VALUES 
		('${escape(name)}', '${escape(code)}', '${type}', '${lat}', '${lon}', '${elevation}'); 
	SELECT LAST_INSERT_ID() as id
`, f )

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

export const addAircraftQuery =  ( aircraftName, pointId, f ) => connectionQuery( `
	INSERT INTO 
		\`fleet\`
		(\`name\`, \`base\`)
	VALUES 
		('${aircraftName}', ${pointId})
`, f )

export const deleteAircraftQuery = ( id, f ) => connectionQuery( `
	DELETE FROM fleet where id=${id}; 
	DELETE FROM flights where aircraft=${id}; 
`, f )

export const addFlightQuery = ( aircraftId, routeId, f ) => connectionQuery( `
	INSERT INTO 
		\`flights\`
		(\`aircraft\`, \`route\`, \`etd\`)
	VALUES 
		('${aircraftId}', '${routeId}', NOW())
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

export const updateFlightQuery = ( { id, timestamp, elapsed, covered, eta }, f ) => connectionQuery( `
	UPDATE 
		\`flights\`
	SET 
		\`timestamp\`=FROM_UNIXTIME(${timestamp}),
		\`elapsed\`=${ Math.round( elapsed ) },
		\`covered\`=${ Math.round( covered ) },
		\`eta\`=${eta ? 'FROM_UNIXTIME(' + eta + ')' : 'NULL'}
	WHERE
		id 
	=
		${id}
`, f )

export const updateAircraftQuery = ( { id, timestamp, lat, lon, altitude, speed, heading, charge }, f ) => connectionQuery( `
	UPDATE 
		fleet
	SET 
		charge=${ Math.round( charge ) },
		lat=${ lat },
		lon=${ lon },
		heading=${ Math.round( heading ) },
		speed=${ Math.round( speed ) },
		altitude=${ Math.round( altitude ) }
	WHERE
		id=${id}
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

export const addRouteQuery = ( { origin, destination, altitude, speed }, f ) => connectionQuery( `
	INSERT INTO 
		\`routes\`
		(\`origin\`, \`destination\`, \`altitude\`, \`speed\`)
	VALUES 
		('${origin}', '${destination}', '${altitude}', '${speed}')
`, f )

export const addPointToRouteQuery = ( routeId, sequence, pointId, altitude, speed, f ) => connectionQuery( `
	INSERT INTO 
		\`routes_points\`
		(\`route\`, \`sequence\`, \`point\`, \`altitude\`, \`speed\`)
	VALUES 
		('${routeId}', '${sequence}', '${pointId}', '${altitude}', '${speed}')
`, f )

export const addRouteToRoutesQuery = ( altitude = 0, speed = 0, f ) => connectionQuery( `
	INSERT INTO 
		routes 
		(\`altitude\`, \`speed\`) 
	VALUES 
		(${altitude}, ${speed})
`, f )

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

export const removeRouteQuery = ( routeId, f ) => connectionQuery( `
	UPDATE 
		\`routes\`
	SET 
		\`removed\`
	= 
		1
	WHERE
		id 
	=
		${routeId}
`, f )

