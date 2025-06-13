import fs from 'fs/promises';
import path from 'path';

export class FractalAnalyzer {
  async findInternalFractals(fractalPath: string): Promise<string[]> {
    try {
      const content = await fs.readFile(fractalPath, 'utf-8');
      const internalFractals = new Set<string>();

      // Look for fractal imports and usage patterns
      const fractalPatterns = [
        // Direct fractal imports: import MyFractal from './MyFractal'
        /import\s+(\w+)\s+from\s+['"`][^'"`]*['"`]/g,
        // Named imports: import { MyFractal } from './fractals'
        /import\s*\{\s*([^}]+)\s*\}\s*from\s+['"`][^'"`]*['"`]/g,
        // Dynamic imports: const MyFractal = await import('./MyFractal')
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      ];

      // Extract potential component names from imports
      const importedComponents = this.extractImportedComponents(content);
      
      // Check if imported components are used as JSX elements
      for (const component of importedComponents) {
        if (this.isUsedAsJSXElement(content, component)) {
          // Check if the component file has "use fractal" directive
          const componentPath = await this.resolveComponentPath(fractalPath, component);
          if (componentPath && await this.isFractalFile(componentPath)) {
            internalFractals.add(component);
          }
        }
      }

      // Also look for direct fractal registry calls
      const registryPattern = /registerModule\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = registryPattern.exec(content)) !== null) {
        internalFractals.add(match[1]);
      }

      return Array.from(internalFractals);
    } catch (error) {
      return [];
    }
  }

  private extractImportedComponents(content: string): string[] {
    const components = new Set<string>();
    
    // Default imports: import ComponentName from './path'
    const defaultImportRegex = /import\s+(\w+)\s+from\s+['"`][^'"`]*['"`]/g;
    let match;
    
    while ((match = defaultImportRegex.exec(content)) !== null) {
      const componentName = match[1];
      // Check if it's a component (starts with uppercase)
      if (/^[A-Z]/.test(componentName)) {
        components.add(componentName);
      }
    }

    // Named imports: import { Component1, Component2 } from './path'
    const namedImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s+['"`][^'"`]*['"`]/g;
    
    while ((match = namedImportRegex.exec(content)) !== null) {
      const namedImports = match[1].split(',').map(imp => imp.trim());
      for (const imp of namedImports) {
        const componentName = imp.split(' as ')[0].trim();
        if (/^[A-Z]/.test(componentName)) {
          components.add(componentName);
        }
      }
    }

    return Array.from(components);
  }

  private isUsedAsJSXElement(content: string, componentName: string): boolean {
    // Check for JSX usage: <ComponentName> or <ComponentName/>
    const jsxPattern = new RegExp(`<\\s*${componentName}(?:\\s|>|/)`, 'g');
    return jsxPattern.test(content);
  }

  private async resolveComponentPath(fractalPath: string, componentName: string): Promise<string | null> {
    const fractalDir = path.dirname(fractalPath);
    
    // Common patterns for component files
    const possiblePaths = [
      path.join(fractalDir, `${componentName}.tsx`),
      path.join(fractalDir, `${componentName}.jsx`),
      path.join(fractalDir, componentName, 'index.tsx'),
      path.join(fractalDir, componentName, 'index.jsx'),
      path.join(fractalDir, 'components', `${componentName}.tsx`),
      path.join(fractalDir, 'components', `${componentName}.jsx`),
    ];

    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        return possiblePath;
      } catch {
        // Continue checking other paths
      }
    }

    return null;
  }

  private async isFractalFile(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.trimStart().startsWith('"use fractal"') || 
             content.trimStart().startsWith("'use fractal'");
    } catch {
      return false;
    }
  }
}