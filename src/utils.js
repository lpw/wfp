export const setLocalStorage = ( key, val ) => typeof window !== 'undefined' && window[ 'localStorage' ] && ( window.localStorage[ key ] = val )
export const getLocalStorage = key => typeof window !== 'undefined' && window[ 'localStorage' ] && window.localStorage[ key ]

// export const getKeyword = () => typeof window !== 'undefined' && window.location.pathname.replace( /^\//, '' )
// export const setKeyword = ( keyword = '' ) => typeof window !== 'undefined' && typeof window.history !== 'undefined' && typeof window.history.replaceState === 'function' && window.history.replaceState( {}, null, `/${keyword}` )

const dev = typeof window !== 'undefined' ? window.location.hostname === 'localhost' : false	// os.hostname().includes( 'lance' )
export const hostname = 'localhost'
export const getPrefix = () => dev ? 'http://localhost:3001' : `http://${hostname}`

