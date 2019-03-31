const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const settings = {
    entry: [
        '@babel/polyfill', './src/main.js'
    ],
    output: {
        filename: 'js/[name].js',
        publicPath: './',
        path: path.resolve('dist')
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
                    'style-loader',
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            importLoaders: 1,
                            plugins: () => [
                                require('autoprefixer')({ browsers: ['last 3 versions'] }),
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                    },
                    'less-loader'
                ]
            },
            {
                test: /\.(woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?)$/,
                loader: 'url-loader?limit=10000',
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ttf|eot)$/,
                loader: 'file-loader?name=[name].[ext]?[hash]',
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Token Transfer Dapp',
            filename: 'index.html',
            template: 'src/www/main.html'
        }),
        new CopyWebpackPlugin([
            {
                from: 'node_modules/eth-contract-metadata/images',
                to: 'images/contractLogos',
                test: /([^/]+)\/(.+)\.(png|jpg|jpeg|gif|svg|ttf|eot)$/
            },
            {
                from: 'src/images/icons',
                to: 'images/icons',
                test: /([^/]+)\/(.+)\.(png|jpg|jpeg|gif|svg|ttf|eot)$/
            }
        ])
    ],
};

module.exports = settings;
