import { RentAllAssetCopyPlugin } from './asset-copy'
const path = require('path')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const AssetsPlugin = require('assets-webpack-plugin');
const webpack = require('webpack');
const smp = new SpeedMeasurePlugin();
const outputDir = path.resolve(__dirname, '../build/public')
import webpackConfig from './webpack.config';

const { ESBuildMinifyPlugin } = require('esbuild-loader')
const TerserPlugin = require("terser-webpack-plugin");
const [config, cssLoaderLegacySupportPlugins, buildMode ] = webpackConfig
import {ifDebug} from './lib/utils'

module.exports = smp.wrap({
    mode: config.mode,
    context: config.context,
    name: 'client',
    devtool: "eval-cheap-source-map",
    entry: {
        client: [
            'babel-polyfill',
            './src/clientLoader.js',
        ],
    },
    output: {
        publicPath: config.output.publicPath,
        path: outputDir,
        filename: ifDebug('[name].js', '[chunkhash:8].js'),
        chunkFilename: ifDebug('[name].chunk.js', '[chunkhash:8].chunk.js'),
    },
    externals: [],
    resolve: {
        fallback: {
            "crypto": false,
            "fs": false,
            "path": require.resolve("path-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "url": require.resolve("url"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "assert": require.resolve("assert"),
        }
    },
    optimization: {
        minimize: ifDebug(false, true),
        minimizer: [ 
            new TerserPlugin(),
        ],
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                },
            },
        },
    },

    plugins: [
        new RentAllAssetCopyPlugin(),
        new webpack.ProgressPlugin(),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': ifDebug('"development"', '"production"'),
            'process.env.BROWSER': true,
            'process.env.RENTALL_BUILD_MODE': `"${buildMode}"`,
            __DEV__: ifDebug(true, false),
        }),

        new AssetsPlugin({
            path: path.resolve(__dirname, '../build'),
            filename: 'assets.json',
            prettyPrint: true,
            removeFullPathAutoPrefix: true,
        }),
       cssLoaderLegacySupportPlugins.plugins,
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, '../src')
                ],
                use: [
                    cssLoaderLegacySupportPlugins.loader,
                    {
                        loader: 'esbuild-loader',
                        options: {
                            loader: 'jsx',
                            target: 'es2015',
                        }
                    },
                ]
            },
            ...config.module.rules,
        ]
    }
})