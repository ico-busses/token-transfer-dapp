const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

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
const cssFilename = '[hash:base64:5]';
const cssClassName = 'static/css/[name].[contenthash:8].css';
const extractLess = new ExtractTextPlugin({
  filename: cssFilename,
  disable: true
})

const settings = merge(baseConfig, {
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.less$/,
        exclude: [
          path.resolve(paths.src, 'components'),
        ],
        use: extractLess.extract({
          fallback: {
            loader: 'style-loader',
            options: {
              hmr: true,
            },
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                minimize: false,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                // Necessary for external CSS imports to work
                // https://github.com/facebookincubator/create-react-app/issues/2677
                ident: 'postcss',
                plugins: () => [
                  autoprefixer(autoprefixerOptions),
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
            loader: 'style-loader',
            options: {
              hmr: true,
            },
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                localIdentName: cssClassName,
                modules: true,
                minimize: false,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                // Necessary for external CSS imports to work
                // https://github.com/facebookincubator/create-react-app/issues/2677
                ident: 'postcss',
                plugins: () => [
                  autoprefixer(autoprefixerOptions),
                ],
              },
            },
            'less-loader'
          ],
        }),
      }
    ]
  },
  devServer: {
    contentBase: path.resolve('src/'),
    publicPath: 'http://localhost:8080/', // full URL is necessary for Hot Module Replacement if additional path will be added.
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
    })
  ],
});

module.exports = settings;
