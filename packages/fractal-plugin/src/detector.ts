import { readFile } from 'fs/promises';
import { join, relative } from 'path';
import { glob } from 'glob';
import { createHash } from 'crypto';

export interface DetectedFractal {
  id: string;
  filePath: string;
  source: string;
  hash: string;
}

export interface FractalDetectorOptions {
  projectRoot: string;
  registryUrl: string;
}

export class FractalDetector {
  constructor(private options: FractalDetectorOptions) {}

  async detectFractals(): Promise<DetectedFractal[]> {
    const files = await glob('**/*.{tsx,jsx,ts,js}', {
      cwd: this.options.projectRoot,
      ignore: ['node_modules/**', '.next/**', 'dist/**']
    });

    const fractals = await Promise.all(
      files.map(async file => {
        const path = join(this.options.projectRoot, file);
        const content = await readFile(path, 'utf-8');
        
        if (!content.includes('use fractal')) return null;
        
        return {
          id: relative(this.options.projectRoot, path)
            .replace(/\.(tsx?|jsx?)$/, '')
            .replace(/[\/\\]/g, '-'),
          filePath: path,
          source: content,
          hash: createHash('sha256').update(content).digest('hex')
        };
      })
    );

    return fractals.filter(Boolean) as DetectedFractal[];
  }

  async uploadFractals(fractals: DetectedFractal[]): Promise<Map<string, Error>> {
    const errors = new Map<string, Error>();
    
    await Promise.all(
      fractals.map(async ({ id, source }) => {
        try {
          const response = await fetch(`${this.options.registryUrl}/fractals/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source })
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
        } catch (error) {
          errors.set(id, error as Error);
        }
      })
    );
    
    return errors;
  }
}