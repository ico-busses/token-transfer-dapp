require("babel-polyfill");
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const settings = {
    entry: [
        "babel-polyfill", "./src/main.js"
    ],
    output: {
        filename: "js/[name].js",
        publicPath: "./",
        path: path.resolve("dist")
    },
    resolve: {
        extensions: [".js", ".json"],
        alias: {
            '../../theme.config$': path.join(__dirname, '../src/assets/theme/theme.config')
        }
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                exclude: path.resolve(__dirname, 'node_modules')
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",


            }, {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            sourceMap: true,
                            importLoaders: 1,
                            localIdentName: "[name]--[local]--[hash:base64:8]"
                        }
                    },
                    "postcss-loader" // has separate config, see postcss.config.js nearby
                ]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/fontwoff',
                include: [/[\/\\]node_modules[\/\\]semantic-ui-less[\/\\]/]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                loader: 'url-loader?limit=10240&absolute&name=images/[path][name]-[hash:7].[ext]',
                include: [/[\/\\]node_modules[\/\\]semantic-ui-less[\/\\]/]
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Token Transfer Dapp',
            filename: 'index.html',
            template: 'src/www/main.html'
        }),
        // this handles the bundled .css output file
        new ExtractTextPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],
};

module.exports = settings;
