export const setLocalStorage = ( key, val ) => typeof window !== 'undefined' && window[ 'localStorage' ] && ( window.localStorage[ key ] = val )
export const getLocalStorage = key => typeof window !== 'undefined' && window[ 'localStorage' ] && window.localStorage[ key ]

// export const getKeyword = () => typeof window !== 'undefined' && window.location.pathname.replace( /^\//, '' )
// export const setKeyword = ( keyword = '' ) => typeof window !== 'undefined' && typeof window.history !== 'undefined' && typeof window.history.replaceState === 'function' && window.history.replaceState( {}, null, `/${keyword}` )

const dev = typeof window !== 'undefined' ? window.location.hostname === 'localhost' : false	// os.hostname().includes( 'lance' )
export const hostname = 'gas'
export const getPrefix = () => dev ? 'http://localhost:3001' : `http://${hostname}`

export const getIdFromText = ( text, points ) => {
	if( typeof text === 'string') {
		text = text.toUpperCase()
	}
    let point
    let id
    if( text ) {
        point = points[ text ]
        if( !point ) {
            point = points[ `K${text}` ]
        }
        if( point ) {
            id = point.id
        }
    }
    return id
}

export const getCodeFromText = ( text, points ) => {
	const id = getIdFromText( text, points )
	let point
	let code
    if( id ) {
        point = points[ id ]
    }
    if( point ) {
        code = point.code
    }
    if( !code ) {
        code = ''
    }
    return code
}

