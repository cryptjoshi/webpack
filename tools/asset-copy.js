import path from 'path';
import chokidar from 'chokidar';
import { writeFile, copyFile, makeDir, copyDir, cleanDir } from './lib/fs';
import pkg from '../package.json';


/**
 * Asset Copy retain and improve from legacy build tool
 * in tools_legacy/lib/cp.js
 */
export class RentAllAssetCopyPlugin {
  constructor() {
    this.copy = this.copy.bind(this)
  }
  apply(compiler) {
    compiler.hooks.done.tap('RentAllAssetCopyPlugin', () => {
      this.copy()
    });
  }

  /**
   * Copies static files such as robots.txt, favicon.ico to the
   * output (build) folder.
   */
  async copy() {
    await makeDir('/build');
    await Promise.all([
      writeFile('build/package.json', JSON.stringify({
        private: true,
        engines: pkg.engines,
        dependencies: pkg.dependencies,
        scripts: {
          start: 'node server.js',
        },
      }, null, 2)),
      copyFile('LICENSE.txt', 'build/LICENSE.txt'),
      copyDir('node_modules/bootstrap/dist/css', 'build/public/css'),
      copyDir('node_modules/dropzone/dist/min', 'build/public/css/min'),
      copyDir('node_modules/bootstrap/dist/fonts', 'build/public/fonts'),
      copyDir('public', 'build/public'),
      copyDir('src/messages', 'build/messages'),
    ]);

    if (process.argv.includes('--watch')) {
      const watcher = chokidar.watch([
        'src/messages/**/*',
        'public/**/*',
      ], { ignoreInitial: true });

      watcher.on('all', async (event, filePath) => {
        const start = new Date();
        const src = path.relative('./', filePath);
        const dist = path.join('build', src.startsWith('src') ? path.relative('src', src) : src);
        switch (event) {
          case 'add':
          case 'change':
            await makeDir(path.dirname(dist));
            await copyFile(filePath, dist);
            break;
          case 'unlink':
          case 'unlinkDir':
            cleanDir(dist, { nosort: true, dot: true });
            break;
          default:
            return;
        }
        const end = new Date();
        const time = end.getTime() - start.getTime();
      });
    }
  }
}