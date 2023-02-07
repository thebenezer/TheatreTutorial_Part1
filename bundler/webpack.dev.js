const path = require('path')
const common = require('./webpack.common')
const { merge }  = require('webpack-merge') 
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common,{
    mode: "development",

    output:
    {
        filename: '[name].js',
        path: path.resolve(__dirname, '../build'),
        // assetModuleFilename: 'assets/images/[name].[ext]'
    },
    plugins: [
            new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            // minify: true
            }),
            new CompressionPlugin({
                algorithm:'gzip'
            })
        ],
    module:
    {
        rules:
        [
            // CSS
            {
                test: /\.css$/,
                use:[ 'style-loader','css-loader' ]
            },
        ]
    }
})
