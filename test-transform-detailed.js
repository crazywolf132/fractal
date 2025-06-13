const fs = require('fs');
const path = require('path');

// We'll need to manually implement the transform steps to debug
const FRACTAL_MARKER = /^["']use fractal["'];?\s*\n?/;

function stripTypeScript(source) {
  let code = source;
  
  console.log('=== BEFORE TypeScript stripping ===');
  console.log(code);
  
  // Remove interface declarations
  code = code.replace(/interface\s+\w+\s*{[^}]+}/g, '');
  console.log('\n=== After removing interfaces ===');
  console.log(code);
  
  // Remove type declarations
  code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // Remove type annotations from parameters and variables
  code = code.replace(/:\s*\w+(\[\])?(\s*[|&]\s*\w+(\[\])?)*(\s*=)?/g, (match) => {
    console.log(`Replacing type annotation: "${match}"`);
    // Keep the equals sign if it's a default parameter
    return match.includes('=') ? ' =' : '';
  });
  console.log('\n=== After removing type annotations ===');
  console.log(code);
  
  // Remove generic type parameters
  code = code.replace(/<[^>]+>/g, '');
  console.log('\n=== After removing generics ===');
  console.log(code);
  
  // Remove 'as' type assertions
  code = code.replace(/\s+as\s+\w+/g, '');
  
  // Remove type imports
  code = code.replace(/import\s+type\s*{[^}]+}\s*from\s*['"][^'"]+['"]/g, '');
  
  return code;
}

function extractStyles(source, id) {
  let styles = '';
  let code = source;
  
  // Extract <style> tags
  const styleRegex = /<style(?:\s+[^>]*)?>([^<]+)<\/style>/gi;
  code = code.replace(styleRegex, (match, css) => {
    styles += css.trim() + '\n';
    return '';
  });
  
  // Extract CSS imports (remove them, they should be bundled)
  const importRegex = /import\s+['"]([^'"]+\.css)['"]/g;
  code = code.replace(importRegex, '');
  
  // Extract styled-components (simplified)
  const styledRegex = /styled\.(\w+)`([^`]+)`/g;
  code = code.replace(styledRegex, (match, tag, css) => {
    const className = `fractal-${id}-${Math.random().toString(36).substr(2, 5)}`;
    styles += `.${className} { ${css.trim()} }\n`;
    return `(props) => React.createElement('${tag}', { ...props, className: '${className}' })`;
  });
  
  return { 
    code: code.trim(), 
    styles: styles.trim() || null 
  };
}

function transformCode(code) {
  let transformed = code;
  
  console.log('\n=== BEFORE ES module transformation ===');
  console.log(transformed);
  
  // Transform default exports
  transformed = transformed.replace(
    /export\s+default\s+function\s+(\w+)/g, 
    'module.exports.default = function $1'
  );
  
  transformed = transformed.replace(
    /export\s+default\s+/g, 
    'module.exports.default = '
  );
  
  console.log('\n=== After transforming default exports ===');
  console.log(transformed);
  
  // Transform named exports
  transformed = transformed.replace(
    /export\s+{\s*([^}]+)\s*}/g,
    (match, exports) => {
      return exports.split(',').map((exp) => {
        const name = exp.trim();
        return `module.exports.${name} = ${name};`;
      }).join('\n');
    }
  );
  
  // Transform single named exports like "export const ButtonGroup"
  transformed = transformed.replace(
    /export\s+const\s+(\w+)/g,
    'const $1'
  );
  
  console.log('\n=== After transforming named exports ===');
  console.log(transformed);
  
  // Transform imports
  transformed = transformed.replace(
    /import\s+React(?:,\s*{([^}]+)})?\s+from\s+['"]react['"]/g,
    (match, namedImports) => {
      if (namedImports) {
        return `const React = require('react');\nconst {${namedImports}} = React;`;
      }
      return `const React = require('react');`;
    }
  );
  
  transformed = transformed.replace(
    /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g,
    'const {$1} = require("$2")'
  );
  
  transformed = transformed.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
    'const $1 = require("$2")'
  );
  
  console.log('\n=== After transforming imports ===');
  console.log(transformed);
  
  return transformed;
}

async function testTransform() {
  try {
    // Read the Button.tsx component
    const buttonPath = path.join(__dirname, 'packages/fractal-registry/Button.tsx');
    const source = fs.readFileSync(buttonPath, 'utf-8');
    
    console.log('=== ORIGINAL SOURCE ===');
    console.log(source);
    console.log('\n');
    
    // Step 1: Remove fractal marker
    const cleanSource = source.replace(FRACTAL_MARKER, '');
    console.log('=== After removing fractal marker ===');
    console.log(cleanSource);
    
    // Step 2: Strip TypeScript
    const jsCode = stripTypeScript(cleanSource);
    
    // Step 3: Extract styles
    const { code, styles } = extractStyles(jsCode, 'Button');
    console.log('\n=== After extracting styles ===');
    console.log('Code:', code);
    console.log('Styles:', styles);
    
    // Step 4: Transform code
    const transformed = transformCode(code);
    
    // Step 5: Final output
    const finalOutput = `
${transformed}

if (module.exports && module.exports.default) {
  module.exports.default.__fractalId = "Button";
  ${styles ? `module.exports.__styles = ${JSON.stringify(styles)};` : ''}
}`;
    
    console.log('\n=== FINAL OUTPUT ===');
    console.log(finalOutput);
    
  } catch (error) {
    console.error('Error during transformation:', error.message);
    console.error(error.stack);
  }
}

testTransform();