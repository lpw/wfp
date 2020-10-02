const mysql = require('mysql')

// behavior during dev
const dev = process.env.DEV

let config = dev ? {
		host     : 'localhost',
		user     : 'root',
		password : 'lpw9661@M',
		database : 'wisk',
		multipleStatements: true
	} : {
		host     : '35.232.198.218',
		user     : 'root',
		// password : 'secret', // left the doors open in this playarea
		database : 'wisk',
		multipleStatements: true
	}

const connection = mysql.createConnection( config )

connection.connect()

export const connectionQuery = ( q, f ) => {
	connection.query( q, f )
}
