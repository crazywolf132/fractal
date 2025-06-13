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
  private detector: FractalDetector;
  private transformer: FractalTransformer;
  private packageFinder: PackageFinder;
  private manifestGenerator: ManifestGenerator;

  constructor() {
    this.detector = new FractalDetector();
    this.transformer = new FractalTransformer();
    this.packageFinder = new PackageFinder();
    this.manifestGenerator = new ManifestGenerator();
  }

  async build(options: BuildOptions): Promise<BuildResult[]> {
    const searchDir = options.input || process.cwd();
    console.log(chalk.blue(`Building fractals from ${searchDir}...`));

    // Find all fractal components
    const fractals = await this.detector.findFractals(searchDir);
    
    if (fractals.length === 0) {
      console.log(chalk.yellow('No fractal components found.'));
      return [];
    }

    console.log(chalk.green(`Found ${fractals.length} fractal components`));

    // Ensure output directory exists
    await fs.mkdir(options.output, { recursive: true });

    // Build each fractal with esbuild
    const results: BuildResult[] = [];
    for (const fractal of fractals) {
      const result = await this.buildFractal(fractal, options);
      if (result) {
        results.push(result);
      }
    }

    console.log(chalk.green('✨ Build complete!'));
    return results;
  }

  private async buildFractal(fractal: FractalInfo, options: BuildOptions): Promise<BuildResult | null> {
    try {
      // Find the closest package.json
      const packageInfo = await this.packageFinder.findClosestPackage(fractal.filePath);
      
      if (!packageInfo) {
        console.log(chalk.yellow(`  ⚠ No package.json found for ${fractal.fileName}, skipping...`));
        return null;
      }

      // Generate fractal name using package info
      const fractalName = this.packageFinder.generateFractalName(packageInfo, fractal.fileName);
      const safeFileName = fractalName.replace(/::/g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');
      const outputPath = path.join(options.output, `${safeFileName}.js`);

      // Transform the fractal component
      const transformed = await this.transformer.transform(fractal.filePath, fractalName);
      
      // Create a temporary file with the transformed content
      const tempFile = path.join(options.output, `.temp-${safeFileName}.js`);
      await fs.writeFile(tempFile, transformed);

      // Build with esbuild
      const result = await esbuild.build({
        entryPoints: [tempFile],
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

      // Clean up temp file
      await fs.unlink(tempFile);

      // Generate manifest
      const manifestPath = await this.manifestGenerator.generateManifest(
        fractalName,
        fractal.filePath,
        packageInfo,
        options.output
      );

      // Write metadata
      const metadataPath = path.join(options.output, `${safeFileName}.meta.json`);
      const metadata = {
        name: fractalName,
        originalPath: fractal.filePath,
        packageName: packageInfo.name,
        packageVersion: packageInfo.version,
        packagePath: packageInfo.path,
        outputSize: result.metafile?.outputs[outputPath]?.bytes || 0,
        buildTime: new Date().toISOString(),
        manifestPath,
      };
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      console.log(chalk.gray(`  ✓ Built ${fractalName}`));
      
      return {
        name: fractalName,
        filePath: fractal.filePath,
        outputPath,
        manifestPath,
        metadata,
      };
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to build ${fractal.fileName}:`), error);
      return null;
    }
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