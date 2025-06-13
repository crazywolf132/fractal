import fs from 'fs/promises';
import path from 'path';
import { PackageInfo } from './package-finder.js';
import { DependencyAnalyzer } from './dependency-analyzer.js';
import { FractalAnalyzer } from './fractal-analyzer.js';
import { GitInfoExtractor } from './git-info-extractor.js';

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

export class ManifestGenerator {
  private dependencyAnalyzer: DependencyAnalyzer;
  private fractalAnalyzer: FractalAnalyzer;
  private gitInfoExtractor: GitInfoExtractor;

  constructor() {
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.fractalAnalyzer = new FractalAnalyzer();
    this.gitInfoExtractor = new GitInfoExtractor();
  }

  async generateManifest(
    fractalName: string,
    fractalPath: string,
    packageInfo: PackageInfo,
    outputDir: string
  ): Promise<string> {
    const manifest: FractalManifest = {
      name: fractalName,
      version: packageInfo.version,
      generationDate: new Date().toISOString(),
      dependencies: await this.dependencyAnalyzer.analyzeDependencies(packageInfo.path),
      internalFractals: await this.fractalAnalyzer.findInternalFractals(fractalPath),
      repository: await this.gitInfoExtractor.extractGitInfo(fractalPath),
      parentApplication: {
        name: packageInfo.name,
        version: packageInfo.version,
        path: packageInfo.path,
      },
      source: {
        filePath: fractalPath,
        relativePath: path.relative(path.dirname(packageInfo.path), fractalPath),
      },
    };

    // Write manifest file
    const safeFileName = fractalName.replace(/::/g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');
    const manifestPath = path.join(outputDir, `${safeFileName}.manifest.json`);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    return manifestPath;
  }
}