const debug = require('debug')('wfp:db')
const mysql = require('mysql')

// behavior during dev
const dev = process.env.DEV

let config = dev ? {
		host     : 'localhost',
		user     : 'root',
		password : 'lance123',
		database : 'flms',
		multipleStatements: true
	} : {
		host     : '35.232.198.218',
		user     : 'root',
		// password : 'secret', // left the doors open in this playarea
		database : 'flms',
		multipleStatements: true
	}

const connection = mysql.createConnection( config )

connection.connect()

export const connectionQuery = ( q, f ) => {
    debug( 'connectionQuery q', q )
	connection.query( q, f )
}
