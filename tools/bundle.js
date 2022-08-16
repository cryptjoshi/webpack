import webpack from 'webpack';
import webpackConfig from './webpack.config';
const [config] =webpackConfig
import clientConfig from '../webpack5-tools/webpack.client.config';
/**
 * Creates application bundles from the source files.
 */
function bundle() {
  return new Promise((resolve, reject) => {
    webpack(clientConfig).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      //console.log(stats.toString(config[0].stats));
      return resolve();
    });
  });
}

export default bundle;
