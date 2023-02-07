const path = require('path')
const common = require('./webpack.common')
const { merge }  = require('webpack-merge') 
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");





module.exports = merge(common,{
    mode: "production",
    devtool: false,
    output:
    {
        filename: '[contenthash].js',
        path: path.resolve(__dirname, '../build'),
        assetModuleFilename: 'assets/images/[hash][ext]'
    },
    optimization: {
        minimizer: [
          // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
          `...`,
          new CssMinimizerPlugin(),
        ],
        moduleIds: 'deterministic',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                    // get the name. E.g. node_modules/packageName/not/this/part.js
                    // or node_modules/packageName
                    const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
    
                    // npm package names are URL-safe, but some servers don't like @ symbols
                    return `npm.${packageName.replace('@', '')}`;
                },
                },
            },
        },
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCSSExtractPlugin({filename: '[hash].css'}),
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
                use:[ MiniCSSExtractPlugin.loader,'css-loader' ]
            },
        ]
    }
 
})
