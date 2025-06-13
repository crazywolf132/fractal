import chalk from 'chalk';
import { FractalBuilder } from '../utils/fractal-builder.js';
import { uploadToRegistry } from '../utils/registry-uploader.js';

interface BuildCommandOptions {
  input?: string;
  output: string;
  watch?: boolean;
  registry?: string;
}

export async function buildCommand(options: BuildCommandOptions): Promise<void> {
  try {
    const builder = new FractalBuilder();

    if (options.watch) {
      await builder.watch(options);
    } else {
      const results = await builder.build(options);

      // Upload to registry if specified
      if (options.registry && results.length > 0) {
        console.log(chalk.blue(`\nUploading fractals to registry at ${options.registry}...`));
        await uploadToRegistry(options.output, options.registry);
      }
    }
  } catch (error) {
    console.error(chalk.red('Build failed:'), error);
    process.exit(1);
  }
}