require("babel-polyfill");
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
    extensions: [".js", ".json"]
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
    ]
  },
  plugins: [
   new webpack.optimize.AggressiveMergingPlugin(),//Merge chunks
   new UglifyJSPlugin(),
    new HtmlWebpackPlugin({
      title: 'Token Transfer Dapp',
      filename: 'index.html',
      template: 'src/www/main.html'
    }),
    new CopyWebpackPlugin([
      { from: 'src/lib', to: 'lib' },
      { from: 'src/assets', to: 'assets' }
      ])
  ],
};

module.exports = settings;
