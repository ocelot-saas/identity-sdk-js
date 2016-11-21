const path = require('path');
const webpack = require('webpack');


module.exports = {
    entry: './src/index.js',
    output: {
	path: path.resolve(__dirname, 'dist'),
	filename: 'identity-sdk-js.js',
	libraryTarget: 'commonjs'
    },
    target: 'node',
    module: {
	loaders: [{
            test: /\.(js)$/,
            include: [path.resolve(__dirname, 'src')],
            loader: 'babel',
            query: {
                cacheDirectory: path.resolve(__dirname, 'dist-cache'),
                presets: ['es2015'],
                plugins: ['transform-runtime']
            }
        }, {
	    test: /\.(json)$/,
	    include: [
		path.resolve(__dirname, 'src'),
		path.resolve(__dirname, 'node_modules')
	    ],
	    loader: 'json'
	}]
    },
    plugins: [
	new webpack.IgnorePlugin(/vertx/),
	// new webpack.IgnorePlugin(/\/iconv-loader$/)
    ],
    resolve: {
	extensions: ['', '.js', '.json'],
	root: [
	    path.resolve(__dirname, 'src')
	]
    },
    devtool: 'source-map'
}


