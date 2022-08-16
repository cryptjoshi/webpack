import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import pkg from '../package.json';
var StringReplacePlugin = require("string-replace-webpack-plugin");
const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');
const isAnalyze = process.argv.includes('--analyze') || process.argv.includes('--analyse');

// buildMode determine routes to the bundle result
// there are 3 options
// - main: build only main application routes
// - admin: build only admin application routes
// - all: build both of them (will take more time)
const buildMode = process.env.RENTALL_BUILD_MODE || 'all';
console.log('build with mode:', buildMode)
/**
 * this is css legacy support replacement which
 * will add esModule=false into each inline css loader
 * which hard coded in source code to avoid any source
 * modification
 */



 const cssLoaderLegacySupportPlugins = {
  plugins: [
      new StringReplacePlugin(),
  ],
  loader: [
      {
          loader: StringReplacePlugin.replace({
              replacements: [
                  {
                      pattern: /css-loader\!/g,
                      replacement: function (match, p1, offset, string) {
                          return 'css-loader?esModule=false!';
                      }
                  }
              ]
          })
      },
  ],
}

const config =  {
        mode: isDebug?'development': 'production',
        context: path.resolve(__dirname, '..'),
        output: {
          path: path.resolve(__dirname, '../build'),
        },
        module: {
            rules: [
              {
                test: /\.css/,
                include: [
                    path.resolve(__dirname, '../node_modules')
                ],
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
                ],
              },
              {
                test: /\.css/,
                exclude: [
                    path.resolve(__dirname, '../node_modules')
                ],
                use: [
                    {
                        loader: 'isomorphic-style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: false,
                            modules: true,
                            esModule: false,
                            modules: {
                                localIdentName: isDebug ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
                            },
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
                    {
                      test: /\.(graphql|gql)$/,
                      exclude: /node_modules/,
                      loader: 'graphql-tag/loader',
                    },
                    {
                        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                        loader: 'file-loader',
                        options: {
                            name: isDebug ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
                        }
                    },
                ],
              },
              {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [
                  path.resolve(__dirname, '../src'),
                ],
                query: {
                    // https://github.com/babel/babel-loader#options
                    cacheDirectory: isDebug,
          
                //     // https://babeljs.io/docs/usage/options/
                    babelrc: false,
                    presets: [
                //       // A Babel preset that can automatically determine the Babel plugins and polyfills
                //       // https://github.com/babel/babel-preset-env
                       ['env', {
                         targets: {
                           browsers: pkg.browserslist,
                         },
                         modules: false,
                         useBuiltIns: false,
                         debug: false,
                       }],
                       'react',
                       ...isDebug ? [] : ['react-optimize'],
                    ]
                }
                },
                {
                  test: /\.md$/,
                  loader: path.resolve(__dirname, './lib/markdown-loader.js'),
                },
                {
                  test: /\.txt$/,
                  loader: 'raw-loader',
                },
                {
                  test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                  loader: 'file-loader',
                  query: {
                    name: isDebug ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
                  },
                },
                {
                  test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
                  loader: 'url-loader',
                  query: {
                    name: isDebug ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
                    limit: 10000,
                  },
                },
            ]
        },
        plugins: [
          // Adds component stack to warning messages
          // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-source
          ...isDebug ? ['transform-react-jsx-source'] : [],
          // Adds __self attribute to JSX which React will use for some warnings
          // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-self
          ...isDebug ? ['transform-react-jsx-self'] : [],
          'react-intl',
        ],
         // Don't attempt to continue if there are any errors.
        bail: !isDebug,

        cache: isDebug,

        stats: {
          colors: true,
          reasons: isDebug,
          hash: isVerbose,
          version: isVerbose,
          timings: true,
          chunks: isVerbose,
          chunkModules: isVerbose,
          cached: isVerbose,
          cachedAssets: isVerbose,
        },
}

 
const clientConfig = {
...config,
name: 'client',
target: 'web',

entry: {
  client: ['babel-polyfill', './src/clientLoader.js'],
},

output: {
  ...config.output,
  filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
  chunkFilename: isDebug ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
},
module: {
    ...config.module
},
plugins: [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  // new HtmlWebpackPlugin({
  //     template: 'src/app/index.html'
  // }),
  // // Copy Cesium Assets, Widgets, and Workers to a static directory
  // new CopyWebpackPlugin({
  //     patterns: [
  //         { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
  //         { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
  //         { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }
  //     ]
  // }),
  new webpack.DefinePlugin({
      'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
      'process.env.BROWSER': true,
      __DEV__: isDebug,
    }),
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: 'vendor',
  //     minChunks: module => /node_modules/.test(module.resource),
  //   }),

  //   ...isDebug ? [] : [
  //     // Minimize all JavaScript output of chunks
  //     // https://github.com/mishoo/UglifyJS2#compressor-options
  //     new webpack.optimize.UglifyJsPlugin({
  //       sourceMap: true,
  //       compress: {
  //         screw_ie8: true, // React doesn't support IE8
  //         warnings: isVerbose,
  //         unused: true,
  //         dead_code: true,
  //       },
  //       mangle: {
  //         screw_ie8: true,
  //       },
  //       output: {
  //         comments: false,
  //         screw_ie8: true,
  //       },
  //     }),
  //   ],
  ...isAnalyze ? [new BundleAnalyzerPlugin()] : [],
],
// Choose a developer tool to enhance debugging
// http://webpack.github.io/docs/configuration.html#devtool
devtool: isDebug ? 'cheap-module-source-map' : false,

// Some libraries import Node modules but don't use them in the browser.
// Tell Webpack to provide empty mocks for them so importing them works.
// https://webpack.github.io/docs/configuration.html#node
// https://github.com/webpack/node-libs-browser/tree/master/mock
node: {
fs: 'empty',
net: 'empty',
tls: 'empty',
},
}
const serverConfig = {
    ...config,

  name: 'server',
  target: 'node',

  entry: {
    server: ['babel-polyfill', '../src/server.js'],
  },

  output: {
    ...config.output,
    filename: '../../server.js',
    libraryTarget: 'commonjs2',
  },

  module: {
    ...config.module,
    rules: config.module.rules.map(rule => (rule.loader !== 'babel-loader' ? rule : {
      ...rule,
      query: {
        ...rule.query,
        presets: rule.query.presets.map(preset => (preset[0] !== 'env' ? preset : ['env', {
          targets: {
            node: parseFloat(pkg.engines.node.replace(/^\D+/g, '')).toString(),
          },
          modules: false,
          useBuiltIns: false,
          debug: false,
        }])),
      }
    }))
  },
  externals: [
    /^\.\/assets\.json$/,
    (context, request, callback) => {
      const isExternal =
        request.match(/^[@a-z][a-z/.\-0-9]*$/i) &&
        !request.match(/\.(css|less|scss|sss)$/i);
      callback(null, Boolean(isExternal));
    },
  ],
  plugins: [
    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
      'process.env.BROWSER': false,
      __DEV__: isDebug,
    }),

    // Do not create separate chunks of the server bundle
    // https://webpack.github.io/docs/list-of-plugins.html#limitchunkcountplugin
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

    // Adds a banner to the top of each generated chunk
    // https://webpack.github.io/docs/list-of-plugins.html#bannerplugin
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
  ],

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },

  devtool: isDebug ? 'cheap-module-source-map' : 'source-map',
};
export default  [clientConfig,serverConfig,cssLoaderLegacySupportPlugins,buildMode,config,isDebug]
