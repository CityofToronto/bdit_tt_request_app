const { merge } = require('webpack-merge')
const common = require('./common.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(common, {
    mode: 'production',
    watch: false,
    devtool: 'source-map',
    performance: {
        maxEntrypointSize: 350000, // 350kb
        maxAssetSize: 350000 // 350kb
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:'./src/index_template.html',
            publicPath:'/traveltime-request',
            chunks: ['app']
        })
    ],
} )
