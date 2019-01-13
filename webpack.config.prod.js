const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('./webpack.config.base');

const settings = merge(baseConfig, {
  mode: 'production',
  module: {
    rules: [
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(),//Merge chunks
    new UglifyJSPlugin()
  ],
});

module.exports = settings;
