import fs from 'fs/promises';
import path from 'path';

export interface DependencyInfo {
  production: Record<string, string>;
  development: Record<string, string>;
  peer: Record<string, string>;
}

export class DependencyAnalyzer {
  async analyzeDependencies(packageJsonPath: string): Promise<DependencyInfo> {
    try {
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      return {
        production: packageJson.dependencies || {},
        development: packageJson.devDependencies || {},
        peer: packageJson.peerDependencies || {},
      };
    } catch (error) {
      // If we can't read package.json, return empty dependencies
      return {
        production: {},
        development: {},
        peer: {},
      };
    }
  }

  async getUsedDependencies(
    fractalPath: string,
    allDependencies: DependencyInfo
  ): Promise<DependencyInfo> {
    try {
      const content = await fs.readFile(fractalPath, 'utf-8');
      const imports = this.extractImports(content);
      
      const usedDeps: DependencyInfo = {
        production: {},
        development: {},
        peer: {},
      };

      // Check which dependencies are actually imported
      for (const importName of imports) {
        if (allDependencies.production[importName]) {
          usedDeps.production[importName] = allDependencies.production[importName];
        }
        if (allDependencies.development[importName]) {
          usedDeps.development[importName] = allDependencies.development[importName];
        }
        if (allDependencies.peer[importName]) {
          usedDeps.peer[importName] = allDependencies.peer[importName];
        }
      }

      return usedDeps;
    } catch (error) {
      // If we can't analyze usage, return all dependencies
      return allDependencies;
    }
  }

  private extractImports(content: string): string[] {
    const imports = new Set<string>();
    
    // Match import statements: import ... from 'package'
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Extract package name (handle scoped packages)
      if (!importPath.startsWith('.')) {
        const packageName = importPath.startsWith('@') 
          ? importPath.split('/').slice(0, 2).join('/')
          : importPath.split('/')[0];
        imports.add(packageName);
      }
    }

    // Match require statements: require('package')
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    while ((match = requireRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      if (!importPath.startsWith('.')) {
        const packageName = importPath.startsWith('@') 
          ? importPath.split('/').slice(0, 2).join('/')
          : importPath.split('/')[0];
        imports.add(packageName);
      }
    }

    return Array.from(imports);
  }
}