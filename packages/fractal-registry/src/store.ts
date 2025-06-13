import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { transformFractal } from './transform';

export interface FractalManifest {
  name: string;
  version: string;
  generationDate: string;
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
    peer: Record<string, string>;
  };
  internalFractals: string[];
  repository: {
    url?: string;
    branch?: string;
    commit?: string;
    dirty?: boolean;
  };
  parentApplication: {
    name: string;
    version: string;
    path: string;
  };
  source: {
    filePath: string;
    relativePath: string;
  };
}

export interface StoredFractal {
  id: string;
  source: string;
  compiled: string;
  styles?: string;
  manifest?: FractalManifest;
  createdAt: Date;
}

export class FractalStore {
  private cache = new Map<string, StoredFractal>();
  private path: string;

  constructor(path = './fractal-storage') {
    this.path = path;
    mkdir(path, { recursive: true });
  }

  async addFractal(id: string, source: string, manifest?: FractalManifest): Promise<StoredFractal> {
    const { code, styles } = await transformFractal(source, id);
    
    const fractal: StoredFractal = {
      id,
      source,
      compiled: code,
      styles: styles || undefined,
      manifest,
      createdAt: new Date()
    };

    this.cache.set(id, fractal);
    await writeFile(
      join(this.path, `${id}.json`), 
      JSON.stringify(fractal, null, 2)
    );
    
    return fractal;
  }

  async getFractal(id: string): Promise<StoredFractal | undefined> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    try {
      const data = await readFile(join(this.path, `${id}.json`), 'utf-8');
      const fractal = JSON.parse(data);
      this.cache.set(id, fractal);
      return fractal;
    } catch {
      return undefined;
    }
  }
}