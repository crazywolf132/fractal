import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

export interface FractalInfo {
  filePath: string;
  fileName: string;
}

export class FractalDetector {
  private fractalDirective = '"use fractal"';

  async findFractals(directory: string = process.cwd()): Promise<FractalInfo[]> {
    const patterns = [
      '**/*.jsx',
      '**/*.tsx',
    ];

    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: directory,
        ignore: [
          'node_modules/**', 
          '**/node_modules/**',
          'dist/**', 
          'build/**', 
          '.next/**', 
          'coverage/**',
          '**/.git/**'
        ],
        absolute: true,
      });
      files.push(...matches);
    }

    const fractals: FractalInfo[] = [];
    
    for (const file of files) {
      if (await this.isFractal(file)) {
        fractals.push({
          filePath: file,
          fileName: path.basename(file),
        });
      }
    }

    return fractals;
  }

  async isFractal(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      // Check if the file starts with "use fractal" directive
      return content.trimStart().startsWith(this.fractalDirective);
    } catch (error) {
      return false;
    }
  }
}