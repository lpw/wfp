// This is just for generating the node.js server bundle
// currently severing both index.html (server-side rendered)
// and the API
// To build:
// NODE_ENV=production ./node_modules/.bin/webpack --config webpack.config.js --progress --profile --colors
// To debug:
// API_PORT=3000 DEBUG="*" node --inspect-brk build/server.js
// To run:
// NODE_ENV=production node build/server.js

const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = [
	{
	mode: isProd ? 'production' : 'development',
    optimization:{
        minimize: false, // <---- disables uglify.
        // minimizer: [new UglifyJsPlugin()] if you want to customize it.
    },
		name: 'server',
		target: 'node',
		entry: './src/server/server.js',
		output: {
			path: path.join(__dirname, 'build'),
			filename: 'server.js',
			libraryTarget: 'commonjs2',
			publicPath: '/build/',
		},
		devtool: 'source-map',
		resolve: {
			extensions: ['.js', '.jsx']
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					// exclude: /(node_modules\/)/,
					// include: /node_modules\/ebay-node-api/,
					// include: ['src/', 'node_modules/ebay-node-api/'],
					include: /(src\/|node_modules\/ebay-node-api\/)/,
					// include: [
					//   resolve('src'),
					//   resolve('test'),
					//   resolve('node_modules/webpack-dev-server/client'),
					//   resolve('node_modules/@util/qcmagic')
					// ],
					use: [
						{
							loader: 'babel-loader',
						},
					]
				},
				// copied from node_modules/react-scripts/config/webpack.config.prod.js
				// might not need this anymore since not importing anything like amzn.png
				{
                    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                    loader: require.resolve('url-loader'),
                    options: {}
				},
			    {
			        test: /\.svg$/,
			        loader: 'svg-inline-loader'
			    },
				{
					test: /\.css$/,
					// use: [ 'style-loader', 'css-loader' ]
					use: [ 'css-loader' ]
				}
			],
		},
		plugins: [
		]
	}
];
