const { merge } = require('webpack-merge')
const common = require('./common.js')

module.exports = merge(common, {
    mode: 'production',
    watch: false,
    devtool: 'source-map',
    performance: {
        maxEntrypointSize: 350000, // 350kb
        maxAssetSize: 350000 // 350kb
    },
} )
