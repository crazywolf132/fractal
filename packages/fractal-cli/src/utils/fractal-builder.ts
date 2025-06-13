import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import { FractalDetector, FractalInfo } from './fractal-detector.js';
import { FractalTransformer } from './fractal-transformer.js';
import { PackageFinder, PackageInfo } from './package-finder.js';
import { ManifestGenerator } from './manifest-generator.js';
import chalk from 'chalk';

export interface BuildOptions {
  input?: string;
  output: string;
  watch?: boolean;
}

export interface BuildResult {
  name: string;
  filePath: string;
  outputPath: string;
  manifestPath: string;
  metadata: any;
}

export class FractalBuilder {
  private detector = new FractalDetector();
  private transformer = new FractalTransformer();
  private packageFinder = new PackageFinder();
  private manifestGenerator = new ManifestGenerator();

  async build(options: BuildOptions): Promise<BuildResult[]> {
    const searchDir = options.input || process.cwd();
    console.log(chalk.blue(`Building fractals from ${searchDir}...`));

    const fractals = await this.detector.findFractals(searchDir);
    
    if (fractals.length === 0) {
      console.log(chalk.yellow('No fractal components found.'));
      return [];
    }

    console.log(chalk.green(`Found ${fractals.length} fractal components`));
    await fs.mkdir(options.output, { recursive: true });

    const results = await Promise.allSettled(
      fractals.map(fractal => this.buildFractal(fractal, options))
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<BuildResult> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    const failed = results.filter(result => result.status === 'rejected').length;

    if (failed > 0) {
      console.log(chalk.yellow(`⚠️  ${failed} fractal(s) failed to build`));
    }

    console.log(chalk.green('✨ Build complete!'));
    return successful;
  }

  private async buildFractal(fractal: FractalInfo, options: BuildOptions): Promise<BuildResult | null> {
    try {
      const packageInfo = await this.findPackageInfo(fractal);
      if (!packageInfo) return null;

      const fractalName = this.packageFinder.generateFractalName(packageInfo, fractal.fileName);
      const safeFileName = this.createSafeFileName(fractalName);
      const outputPath = path.join(options.output, `${safeFileName}.js`);

      const buildConfig = await this.prepareBuild(fractal, fractalName, options.output, safeFileName);
      const buildResult = await this.executeBuild(buildConfig, outputPath);
      const manifestPath = await this.generateArtifacts(fractalName, fractal, packageInfo, options.output, safeFileName, buildResult);

      console.log(chalk.gray(`  ✓ Built ${fractalName}`));
      
      return {
        name: fractalName,
        filePath: fractal.filePath,
        outputPath,
        manifestPath,
        metadata: buildResult.metadata,
      };
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to build ${fractal.fileName}:`), error);
      return null;
    }
  }

  private async findPackageInfo(fractal: FractalInfo): Promise<PackageInfo | null> {
    const packageInfo = await this.packageFinder.findClosestPackage(fractal.filePath);
    
    if (!packageInfo) {
      console.log(chalk.yellow(`  ⚠ No package.json found for ${fractal.fileName}, skipping...`));
    }
    
    return packageInfo;
  }

  private createSafeFileName(fractalName: string): string {
    return fractalName.replace(/::/g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  private async prepareBuild(fractal: FractalInfo, fractalName: string, outputDir: string, safeFileName: string): Promise<{ tempFile: string }> {
    const transformed = await this.transformer.transform(fractal.filePath, fractalName);
    const tempFile = path.join(outputDir, `.temp-${safeFileName}.js`);
    
    await fs.writeFile(tempFile, transformed);
    
    return { tempFile };
  }

  private async executeBuild(buildConfig: { tempFile: string }, outputPath: string): Promise<{ metadata: any }> {
    try {
      const buildResult = await esbuild.build({
        entryPoints: [buildConfig.tempFile],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2020',
        outfile: outputPath,
        external: ['react', 'react-dom'],
        minify: true,
        sourcemap: true,
        metafile: true,
        loader: {
          '.jsx': 'jsx',
          '.tsx': 'tsx',
        },
      });

      return {
        metadata: {
          outputSize: buildResult.metafile?.outputs[outputPath]?.bytes || 0,
          buildTime: new Date().toISOString(),
        }
      };
    } finally {
      await fs.unlink(buildConfig.tempFile).catch(() => {});
    }
  }

  private async generateArtifacts(
    fractalName: string, 
    fractal: FractalInfo, 
    packageInfo: PackageInfo, 
    outputDir: string, 
    safeFileName: string,
    buildResult: { metadata: any }
  ): Promise<string> {
    const manifestPath = await this.manifestGenerator.generateManifest(
      fractalName,
      fractal.filePath,
      packageInfo,
      outputDir
    );

    const metadata = {
      name: fractalName,
      originalPath: fractal.filePath,
      packageName: packageInfo.name,
      packageVersion: packageInfo.version,
      packagePath: packageInfo.path,
      manifestPath,
      ...buildResult.metadata,
    };

    const metadataPath = path.join(outputDir, `${safeFileName}.meta.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return manifestPath;
  }

  async watch(options: BuildOptions): Promise<void> {
    const searchDir = options.input || process.cwd();
    console.log(chalk.blue(`Watching for changes in ${searchDir}...`));

    // Initial build
    await this.build(options);

    // Set up file watcher
    const watcher = await import('chokidar');
    const watch = watcher.watch(path.join(searchDir, '**/*.{jsx,tsx}'), {
      ignored: [/node_modules/, /\*\*\/node_modules\/\*\*/, /dist/, /build/, /\.next/, /coverage/, /\.git/],
      persistent: true,
    });

    watch.on('change', async (filePath) => {
      if (await this.detector.isFractal(filePath)) {
        console.log(chalk.blue(`\nChange detected in ${path.basename(filePath)}`));
        const fractalInfo = { filePath, fileName: path.basename(filePath) };
        await this.buildFractal(fractalInfo, options);
      }
    });

    watch.on('add', async (filePath) => {
      if (await this.detector.isFractal(filePath)) {
        console.log(chalk.blue(`\nNew fractal detected: ${path.basename(filePath)}`));
        const fractalInfo = { filePath, fileName: path.basename(filePath) };
        await this.buildFractal(fractalInfo, options);
      }
    });
  }
}