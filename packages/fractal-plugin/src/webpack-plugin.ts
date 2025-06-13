import { Compiler } from 'webpack';
import { FractalDetector } from './detector';
import * as chokidar from 'chokidar';

export interface FractalWebpackPluginOptions {
  registryUrl: string;
  autoUpload?: boolean;
  watch?: boolean;
  projectRoot?: string;
}

export class FractalWebpackPlugin {
  private detector: FractalDetector;
  private options: FractalWebpackPluginOptions;
  private watcher?: chokidar.FSWatcher;

  constructor(options: FractalWebpackPluginOptions) {
    this.options = {
      projectRoot: process.cwd(),
      autoUpload: false,
      watch: false,
      ...options
    };
    
    this.detector = new FractalDetector({
      projectRoot: this.options.projectRoot!,
      registryUrl: this.options.registryUrl
    });
  }

  apply(compiler: Compiler): void {
    compiler.hooks.beforeCompile.tapAsync('FractalPlugin', async (_, callback) => {
      if (this.options.autoUpload) {
        const fractals = await this.detector.detectFractals();
        await this.detector.uploadFractals(fractals);
      }
      callback();
    });

    if (this.options.watch) {
      compiler.hooks.watchRun.tapAsync('FractalPlugin', async (_, callback) => {
        if (!this.watcher) this.startWatcher(compiler);
        callback();
      });

      compiler.hooks.watchClose.tap('FractalPlugin', () => {
        this.watcher?.close();
        this.watcher = undefined;
      });
    }
  }

  private startWatcher(compiler: Compiler): void {
    this.watcher = chokidar.watch(['**/*.{tsx,jsx,ts,js}'], {
      ignored: ['node_modules/**', '.next/**', 'dist/**'],
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', async (path) => {
      const content = await require('fs').promises.readFile(path, 'utf-8');
      if (content.includes('use fractal')) {
        compiler.watching?.invalidate();
      }
    });
  }
}