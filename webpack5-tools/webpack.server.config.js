const webpack = require('webpack')
const path = require('path')
import webpackConfig from '../tools/webpack.config'
import { cssLoaderLegacySupportPlugins } from '../tools/webpack.config'
const [config, buildMode ] = webpackConfig
// const { config, cssLoaderLegacySupportPlugins, buildMode } = require('webpack.config')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const isDebug = true;
const smp = new SpeedMeasurePlugin();

const serverConfig =smp.wrap({
    mode: config.mode,
    context: config.context,
    name: 'server',
    target: 'node',
    entry: {
        client: [
            'babel-polyfill',
            // 'react-hot-loader/patch',
            // 'webpack-hot-middleware/client',
            './src/server.js',
        ]
    },
    output: {
        ...config.output,
        path: path.resolve(__dirname, '../build'),
        filename: 'server-ssr.js',
        libraryTarget: 'commonjs',
    },
    externals: [
        'sharp', 'bcrypt', 'sequelize',
        /^\.\/assets\.json$/,
        ({ context, request }, callback) => {
            const isExternal =
                request.match(/^[@a-z][a-z/.\-0-9]*$/i) &&
                !request.match(/\.(css|less|scss|sss)$/i);
            callback(null, Boolean(isExternal));
        },
    ],
    plugins: [
        //cssLoaderLegacySupportPlugins.plugins,
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.ProgressPlugin({ }),
        new webpack.DefinePlugin({
            'process.env.BROWSER': false,
            'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
            'process.env.RENTALL_BUILD_MODE': `"${buildMode}"`,
            __DEV__: isDebug,
            __CLIENT__: !isDebug,
            __SERVER__: isDebug,
        }),
         new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

    // Adds a banner to the top of each generated chunk
    // https://webpack.github.io/docs/list-of-plugins.html#bannerplugin
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
    ],
    module: {
        rules: [
            ...config.module.rules,
        ]
    }
})

export default serverConfig