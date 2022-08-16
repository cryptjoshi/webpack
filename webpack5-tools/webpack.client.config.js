import { RentAllAssetCopyPlugin } from '../tools/asset-copy'
const path = require('path')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const AssetsPlugin = require('assets-webpack-plugin');
const webpack = require('webpack');
const smp = new SpeedMeasurePlugin();
const outputDir = path.resolve(__dirname, '../build/public')
import webpackConfig from '../tools/webpack.config';
import pkg from '../package.json';
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const zlib = require("zlib");
const CompressionPlugin = require("compression-webpack-plugin");
//const TerserPlugin = require("terser-webpack-plugin");
const [config, cssLoaderLegacySupportPlugins, buildMode ] = webpackConfig
import {ifDebug} from '../tools/lib/utils'
const isDebug = !process.argv.includes('--release');
const clientConfig = {
    mode: config.mode,
    context: config.context,
    name: 'client',
    devtool: "eval-cheap-source-map",
    entry: {
        client:[
            'babel-polyfill',
            './src/clientLoader.js'
        ]
    },
    module:{
        rules: [
            {
                test: /\.css$/,
                use: [
                  'isomorphic-style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      importLoaders: 1,
                      modules: false,
                      esModule: false,
                    }
                  },
                  {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            config: path.resolve(__dirname, '../tools/postcss.config.js'),
                        }
                    },
                  },
                ]
            },
            {
                test: /\.jsx?$/,
                include:[
                    path.resolve(__dirname,'../src')
                ],
                exclude: /node_modules/,
                use: {
                loader: 'babel-loader',
                options:{
                    cacheDirectory: isDebug,
                    babelrc: false,
                            presets: [
                                ["@babel/preset-env",
                                {
                                    targets: {
                                               browsers: pkg.browserslist,
                                             },
                                             modules: false,
                                             useBuiltIns: false,
                                             debug: false,
                                },],
                                "@babel/preset-react"
                       
                            //    ...isDebug ? [] : ['react-optimize'],
                             ]
                }
                
            }
              },
          
                {
                  test: /\.md$/,
                  loader: path.resolve(__dirname, './lib/markdown-loader.js'),
                },
              {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
              },
              {
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: 'graphql-tag/loader',
              },
              {
                  test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                  loader: 'file-loader',
                  options: {
                      name: ifDebug('[path][name].[ext]?[hash:8]' , '[hash:8].[ext]'),
                  }
              },
          
           // ...config.module.rules,
        ]
    },
    output:{
        publicPath:config.output.publicPath,
        path:outputDir,
        filename: ifDebug('[name].js','[chunkhash:8].js'),
        chunkFilename: ifDebug('[name].chunk.js','[chunkhash:8].chunk.js')
    },
    externals:[],
    resolve: {
        fallback:{
            "crypto":false,
            "fs":false,
            "path": require.resolve("path-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "url":require.resolve("url"),
            "http":require.resolve("stream-http"),
            "https":require.resolve("https-browserify"),
            "assert":require.resolve("assert")
        }
    },
    plugins:[
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
          }),
    ]
    
}

export default clientConfig