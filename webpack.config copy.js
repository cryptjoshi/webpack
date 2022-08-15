import path from 'path';
import webpack from 'webpack';
import pkg from './package.json';

const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');

const config =  {
        context: path.resolve(__dirname, '..'),
        output: {
          path: path.resolve(__dirname, '../build/public/assets'),
          publicPath: '/assets/',
          pathinfo: isVerbose,
        },
        module:{
            rules:[
                {
                    test: /\.jsx?$/,
                    loader: 'babel-loader',
                    include: [
                      path.resolve(__dirname, '../src'),
                    ],
                    query: {
                      // https://github.com/babel/babel-loader#options
                      cacheDirectory: isDebug,
            
                      // https://babeljs.io/docs/usage/options/
                      babelrc: false,
                      presets: [
                        // A Babel preset that can automatically determine the Babel plugins and polyfills
                        // https://github.com/babel/babel-preset-env
                        ['env', {
                          targets: {
                            browsers: pkg.browserslist,
                          },
                          modules: false,
                          useBuiltIns: false,
                          debug: false,
                        }],
                        // Experimental ECMAScript proposals
                        // https://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-
                        //'stage-2',
                        // JSX, Flow
                        // https://github.com/babel/babel/tree/master/packages/babel-preset-react
                        //'react',
                        // Optimize React code for the production build
                        // https://github.com/thejameskyle/babel-react-optimize
                        //...isDebug ? [] : ['react-optimize'],
                      ],
                      plugins: [
                        // Adds component stack to warning messages
                        // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-source
                        //...isDebug ? ['transform-react-jsx-source'] : [],
                        // Adds __self attribute to JSX which React will use for some warnings
                        // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-self
                        //...isDebug ? ['transform-react-jsx-self'] : [],
                        //'react-intl',
                      ],
                    },
                  },
                  {
                    test: /\.css/,
                    use: [
                      {
                        loader: 'isomorphic-style-loader',
                      },
                      {
                        loader: 'css-loader',
                        options: {
                          // CSS Loader https://github.com/webpack/css-loader
                          importLoaders: 1,
                          sourceMap: isDebug,
                          // CSS Modules https://github.com/css-modules/css-modules
                          modules: true,
                          localIdentName: isDebug ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
                          // CSS Nano http://cssnano.co/options/
                          minimize: !isDebug,
                          discardComments: { removeAll: true },
                        },
                      },
                      {
                        loader: 'postcss-loader',
                        options: {
                          config: './tools/postcss.config.js',
                        },
                      },
                    ],
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
                  {
                    test: /\.(graphql|gql)$/,
                    exclude: /node_modules/,
                    loader: 'graphql-tag/loader',
                  },
            ]
        },
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
        }

}
const clientConfig = {
    ...config,
    // context: __dirname,
    // mode: 'production',
    //devtool: 'inline-source-map',
    devtool: isDebug ? 'cheap-module-source-map' : false,
    entry: {
        app: ['webpack-hot-middleware/client', '../src/index.js']
    },
    output: {
        ...config.output,
        filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
        chunkFilename: isDebug ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
 
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: [
              path.resolve(__dirname, '../src'),
            ],
        },    
        {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        },
        {
            test: /\.(png|gif|jpg|jpeg|svg)$/i, 
            use: [
                'file-loader?name=[path][name][ext]',
                {
                    loader: 'image-webpack-loader',
                    options: { 
                      bypassOnDebug: true, // webpack@1.x
                      disable: true, // webpack@2.x and newer                           
                      optipng: {                
                        enabled: false
                      }
                    }
                }
            ]
        },
        {        
            test: /\.(json|geojson)$/,
            use: [
                'file-loader?name=[path][name][ext]',
                {  
                    loader: 'json-perf-loader'
                }
            ]
        },
        {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: [ 'url-loader' ]
        }]
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
};
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
  
      // Override babel-preset-env configuration for Node.js
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
        },
      })),
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
export default  [clientConfig,serverConfig]
