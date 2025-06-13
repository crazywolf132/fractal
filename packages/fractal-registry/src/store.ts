import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { transformFractal } from './transform';

export interface StoredFractal {
  id: string;
  source: string;
  compiled: string;
  styles?: string;
  createdAt: Date;
}

export class FractalStore {
  private cache = new Map<string, StoredFractal>();
  private path: string;

  constructor(path = './fractal-storage') {
    this.path = path;
    mkdir(path, { recursive: true });
  }

  async addFractal(id: string, source: string): Promise<StoredFractal> {
    const { code, styles } = await transformFractal(source, id);
    
    const fractal: StoredFractal = {
      id,
      source,
      compiled: code,
      styles: styles || undefined,
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