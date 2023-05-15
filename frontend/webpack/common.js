const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const cssLoader = {
    loader: 'css-loader',
    options: { modules: { 
        auto: /\.module\./,
        localIdentName: '[hash:base64]' } }
        // TODO use '[path][name]__[local]' for development
        // https://github.com/webpack-contrib/css-loader#localidentname
}

module.exports = {
    context: path.join(__dirname,'..'),
    entry: { 
        app: './src/index.jsx',
    },
    output: {
        path: path.resolve(__dirname,'../dist'),
        filename: '[name].[contenthash].js',
        chunkFilename: 'chunk.[contenthash].js'
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                include: path.resolve(__dirname, '../src'),
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ["@babel/preset-react",{"runtime":"automatic"}],
                                ['@babel/preset-env']
                            ],
                            plugins: ["@babel/plugin-transform-runtime"]
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpe?g|gif|geojson|csv|woff2?|eot|(t|o)tf)$/i,
                type: 'asset/resource'
            },
          {
                test: /\.(le|c)ss$/i,
                use: [ 'style-loader', cssLoader, 'less-loader' ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template:'./src/index_template.html',
            publicPath:'/public',
            chunks: ['app']
        })
    ],
    resolve: {
        extensions: ['.js','.jsx']
    }
}
