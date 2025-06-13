import fs from 'fs/promises';
import path from 'path';

export class FractalTransformer {
  async transform(filePath: string, fractalName: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    const componentName = this.extractComponentName(filePath, content);

    // Remove the "use fractal" directive
    let transformed = content.replace(/^["']use fractal["'];\s*\n?/m, '');

    // Wrap the component with module federation setup
    transformed = this.wrapWithModuleFederation(componentName, fractalName, transformed);

    return transformed;
  }

  private extractComponentName(filePath: string, content: string): string {
    // Try to extract from export statement
    const exportMatch = content.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/);
    if (exportMatch) {
      return exportMatch[1];
    }

    // Fall back to filename
    const fileName = path.basename(filePath, path.extname(filePath));
    return fileName.charAt(0).toUpperCase() + fileName.slice(1);
  }

  private wrapWithModuleFederation(componentName: string, fractalName: string, content: string): string {
    return `
import { registerModule } from '@fractal/core';

${content}

// Register the component for module federation with the full fractal name
if (typeof window !== 'undefined') {
  registerModule('${fractalName}', ${componentName});
}

export { ${componentName} };
export default ${componentName};
`;
  }
}