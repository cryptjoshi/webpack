// import cp from 'child_process';
// import extractMessages from './extractMessage';
// import copy from './copy';
// import bundle from './bundle';
// import render from './render';
// import pkg from '../package.json';

/**
 * Compiles the project from source files into a distributable
 * format and copies it to the output (build) folder.
 */
// async function build() {
//   await run(clean);
// //   await run(extractMessages);
// //   await run(copy);
// //   await run(bundle);

// //   if (process.argv.includes('--static')) {
// //     await run(render);
// //   }

// //   if (process.argv.includes('--docker')) {
// //     cp.spawnSync('docker', ['build', '-t', pkg.name, '.'], { stdio: 'inherit' });
// //   }
// }
import run from './run'

import runServer from './runServer';
 
import webpackConfig from './webpack.config';
import clean from './clean';
import extractMessages from './extractMessage';
import copy from './copy';
import bundle from './bundle'
 
async function build() {
    await run(clean);
    // await run(extractMessages);
    // await run(copy);
    // await run(bundle)
    
}
export default build;