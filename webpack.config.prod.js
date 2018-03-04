require('babel-polyfill');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseConfig = require('./webpack.config.base');

const settings = merge(baseConfig, {
  module: {
    rules: [
    ]
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),//Merge chunks
    new UglifyJSPlugin(),
    new CopyWebpackPlugin([
      { from: 'src/lib', to: 'lib' },
      { from: 'src/assets', to: 'assets' }
      ]),
    new webpack.DefinePlugin({
      'process.env': 'production'
    })
  ],
});

module.exports = settings;
