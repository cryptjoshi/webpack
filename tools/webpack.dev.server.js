import * as path from 'path'
import * as util from 'util'
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpack from 'webpack'
import cp from 'child_process';
import { port } from '../src/config'
import { ifDebug } from './lib/utils'
import {cleanDir} from './lib/fs'
const exec = util.promisify(require('child_process').exec);
//const clientConfig = require('../webpack5-tools/webpack.client.config');
const serverConfig = require('./webpack.server.config');
//const config = require('./webpack.config')
import clientConfig from '../webpack5-tools/webpack.client.config';

(async function start() {
    /**
     * just remove current build folder first
     * to avoid any previous build malfunction
     */
    //await exec(`rm -rf ${path.resolve(__dirname, '../build')}`)
    cleanDir(`${path.resolve(__dirname, '../build')}`)
    /**
     * setup hot-load module but on development only
     * this means you can run a production server with
     * NODE_ENV=production yarn serve for pre-testing
     * before golive
     */
    console.log(...clientConfig.entry.client)
    if (ifDebug()) {
        // setting up hot reload entry and plugin to enable it
        // which already support react-hot-reload
        clientConfig.entry.client = [
            'webpack-hot-middleware/client',
            ...clientConfig.entry.client
        ]
        clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
        )
    }

    

    const webpackBundler = webpack(clientConfig)
    const devmw = webpackDevMiddleware(webpackBundler,{
        publicPath: clientConfig.output.publicPath,
        writeToDisk: true
    })
    //console.log(webpackBundler.compilers)
     //const webpackBundler = webpack([clientConfig, serverConfig])

    //const devmw = webpackDevMiddleware(webpackBundler, {
    //     publicPath: clientConfig.output.publicPath,
    //     writeToDisk: true,
    // })
     const hotmw = webpackHotMiddleware(webpackBundler, {});
    devmw.waitUntilValid(() => {
    //    const bs = browserSync.create();
    //     bs.init({
    //         proxy: {
    //             target: `http://localhost:${port}`,
    //             middleware: [devmw, hotmw],
    //         },
    //     }, () => {


    //         console.log(`BrowserSync up and running at http://localhost:${port}`)
    //         console.log('starting backend service....')

           
    //         const server = cp.spawn('node', [path.join(serverConfig.output.path, serverConfig.output.filename)], {
    //             silent: false,
    //             env: {
    //                 ...process.env,
    //                 NODE_ENV: 'development'
    //             }
    //         })

    //         handleServer(server)
    //         server.stderr = process.stderr
    //         process.on('exit', () => {
    //             server.kill('SIGTERM')
    //         })
         })



    // })
})()

function handleServer(server) {
    server.once('exit', (code) => {
        throw new Error(`server terminated unexpectedly with code ${code}`)
    })
    server.stdout.on('data', (data) => {
        process.stdout.write(data);
    })
    server.stderr.on('data', (data) => {
        process.stdout.write(data);
    })
}