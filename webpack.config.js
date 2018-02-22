require("babel-polyfill");
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const settings = {
  entry: [
    "babel-polyfill", "./src/main.js"
  ],
  output: {
    filename: "js/[name].js",
    publicPath: "/",
    path: path.resolve("dist")
  },
  resolve: {
    extensions: [".js", ".json"]
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_modules')
      },
    ]
  },
  devServer: {
    contentBase: path.resolve("src/"),
    publicPath: "http://localhost:8080/", // full URL is necessary for Hot Module Replacement if additional path will be added.
    quiet: false,
    hot: true,
    historyApiFallback: true,
    inline: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new HtmlWebpackPlugin({
      title: 'Token Transfer Dapp',
      filename: 'index.html',
      template: 'src/www/main.html'
    })
  ],
};

module.exports = settings;
