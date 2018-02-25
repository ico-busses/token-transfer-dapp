require('babel-polyfill');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const baseConfig = require('./webpack.config.base');
const paths = {
  src: path.resolve(__dirname, 'src'),
}
const autoPrefixerOpts = {
  browsers: [
    '>1%',
    'last 4 versions',
    'Firefox ESR',
    'not ie < 9', // React doesn't support IE8 anyway
  ],
  flexbox: 'no-2009',
}
const cssFilename = 'static/css/[name].[contenthash:8].css';
const cssClassName = 'static/css/[name].[contenthash:8].css';
const extractLess = new ExtractTextPlugin({
  filename: cssFilename,
  disable: true
})

const settings = merge(baseConfig, {
  module: {
    rules: [
      {
        test: /\.less$/,
        exclude: [
          path.resolve(paths.src, 'components'),
        ],
        use: extractLess.extract({
          fallback: {
            loader: 'style-loader'
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                minimize: true,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [
                  autoprefixer(autoPrefixerOpts),
                ],
              },
            },
            'less-loader'
          ]
        }),
      },
      // Heads up!
      // We apply CSS modules only to our components, this allow to use them
      // and don't break SUI.
      {
        test: /\.less$/,
        include: [
          path.resolve(paths.src, 'components'),
        ],
        use: extractLess.extract({
          fallback: {
            loader: 'style-loader'
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                localIdentName: cssClassName,
                modules: true,
                minimize: true,
                sourceMap: true,
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                // Necessary for external CSS imports to work
                // https://github.com/facebookincubator/create-react-app/issues/2677
                ident: 'postcss',
                plugins: () => [
                  autoprefixer(autoPrefixerOpts),
                ],
              },
            },
            'less-loader'
          ],
        }),
      }
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
