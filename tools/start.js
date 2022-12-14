import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import run from './run'
import runServer from './runServer';
import WriteFilePlugin from 'write-file-webpack-plugin';
//import webpackConfig from './webpack.config';
import clean from './clean';
import extractMessages from './extractMessage';
import copy from './copy';
import clientConfig from '../webpack5-tools/webpack.client.config'
import serverConfig from '../webpack5-tools/webpack.server.config';
const isDebug = !process.argv.includes('--release');
process.argv.push('--watch');

//const [clientConfig, serverConfig] = webpackConfig;
async function start() {
    await run(clean);
    await run(extractMessages);
    await run(copy);
    await new Promise((resolve) => {
        serverConfig.plugins.push(new WriteFilePlugin({ log: false }));
        if (isDebug) {
            clientConfig.entry.client = [...new Set([
              'babel-polyfill',
             // 'react-hot-loader/patch',
              //'webpack-hot-middleware/client',
            ].concat(clientConfig.entry.client))];
            clientConfig.output.filename = clientConfig.output.filename.replace('[chunkhash', '[hash');
            clientConfig.output.chunkFilename = clientConfig.output.chunkFilename.replace('[chunkhash', '[hash');
            //const plugins = clientConfig.module.rules.find(x => x.loader === 'babel-loader');
            //console.log(plugins)
            //query.plugins = ['react-hot-loader/babel'].concat(query.plugins || []);
            clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
            clientConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin());
          }
          const bundler = webpack([clientConfig, serverConfig])
         // console.log(webpackConfig)
        //  const bundler = webpack(webpackConfig);
          const wpMiddleware = webpackDevMiddleware(bundler, {
            // IMPORTANT: webpack middleware can't access config,
            // so we should provide publicPath by ourselves
            publicPath: clientConfig.output.publicPath,
      
            // Pretty colored output
            stats: clientConfig.stats,
      
            // For other settings see
            // https://webpack.github.io/docs/webpack-dev-middleware
          });
          const hotMiddleware = webpackHotMiddleware(bundler.compilers[0]);
      
          let handleBundleComplete = async () => {
            handleBundleComplete = stats => !stats.stats[1].compilation.errors.length && runServer();
      
            const server = await runServer();
            const bs = browserSync.create();
      
            bs.init({
              ...isDebug ? {} : { notify: false, ui: false },
      
              proxy: {
                target: server.host,
                middleware: [wpMiddleware, hotMiddleware],
                proxyOptions: {
                  xfwd: true,
                },
              },
            }, resolve);
          };
      
        //  bundler.plugin('done', stats => handleBundleComplete(stats));
        
    })
}
export default start;