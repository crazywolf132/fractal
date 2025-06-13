#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { buildCommand } from './commands/build.js';

const program = new Command();

program
  .name('fractal')
  .description('CLI tool for building and managing fractal components')
  .version('0.1.0');

program
  .command('build')
  .description('Build fractal components using esbuild (searches from current directory by default)')
  .option('-i, --input <path>', 'Input directory containing fractal components (defaults to current directory)')
  .option('-o, --output <path>', 'Output directory for built fractals', './dist/fractals')
  .option('-w, --watch', 'Watch for changes and rebuild')
  .option('--registry <url>', 'Registry URL to upload built fractals')
  .action(buildCommand);

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}