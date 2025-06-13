import fs from 'fs/promises';
import path from 'path';

export interface PackageInfo {
  name: string;
  version: string;
  path: string;
}

export class PackageFinder {
  private packageCache = new Map<string, PackageInfo | null>();

  async findClosestPackage(filePath: string): Promise<PackageInfo | null> {
    const dir = path.dirname(path.resolve(filePath));
    
    // Check cache first
    if (this.packageCache.has(dir)) {
      return this.packageCache.get(dir) || null;
    }

    let currentDir = dir;
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      
      try {
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        
        if (packageJson.name && packageJson.version) {
          const packageInfo: PackageInfo = {
            name: packageJson.name,
            version: packageJson.version,
            path: packageJsonPath,
          };
          
          // Cache the result
          this.packageCache.set(dir, packageInfo);
          return packageInfo;
        }
      } catch (error) {
        // Continue searching up the directory tree
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }

    // Cache null result
    this.packageCache.set(dir, null);
    return null;
  }

  generateFractalName(packageInfo: PackageInfo, fractalFileName: string): string {
    // Remove file extension and convert to kebab-case
    const baseName = path.basename(fractalFileName, path.extname(fractalFileName));
    const kebabName = baseName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    
    // Clean package name by removing @ and / symbols for registry compatibility
    const cleanPackageName = packageInfo.name.replace(/[@/]/g, '-').replace(/^-+|-+$/g, '');
    
    return `${cleanPackageName}::${kebabName}::${packageInfo.version}`;
  }

  clearCache(): void {
    this.packageCache.clear();
  }
}