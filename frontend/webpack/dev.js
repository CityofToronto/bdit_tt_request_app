const { merge } = require('webpack-merge')
const common = require('./common.js')
var webpack = require('webpack')
const path = require('path')
const dotenv = require('dotenv').config(
	{ path: path.resolve(__dirname, '../.env') }
)
const DeadCodePlugin = require('webpack-deadcode-plugin');

module.exports = merge(common, { 
	mode: 'development',
	watch: true,
	devtool: 'inline-source-map',
	output: {
		chunkFilename: 'chunk.[name].js'
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.REACT_APP_CREDS': JSON.stringify(dotenv.parsed)
		}),
		new DeadCodePlugin({
			patterns: ['src/**/*.(js|jsx|css|less)'],
			detectUnusedExport: false
		})
	],
} )
