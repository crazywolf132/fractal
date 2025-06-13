const fs = require('fs');
const path = require('path');

// Fixed transform functions
const FRACTAL_MARKER = /^["']use fractal["'];?\s*\n?/;

function stripTypeScript(source) {
  let code = source;
  
  // Remove interface declarations
  code = code.replace(/interface\s+\w+\s*{[^}]+}/g, '');
  
  // Remove type declarations
  code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // Remove type annotations from parameters and variables
  // This regex needs to be more careful to handle all cases
  code = code.replace(/:\s*{[^}]+}/g, ''); // Remove object type annotations
  code = code.replace(/:\s*\w+(\.\w+)*(\[\])?(\s*[|&]\s*\w+(\[\])?)*(\s*=)?/g, (match) => {
    return match.includes('=') ? ' =' : '';
  });
  
  // Remove generic type parameters BUT NOT JSX tags
  // Look for generics after function names, type names, etc.
  code = code.replace(/(\w+)\s*<[^>]+>(?=\s*\()/g, '$1'); // Function generics
  code = code.replace(/:\s*\w+<[^>]+>/g, ''); // Type with generics
  
  // Remove 'as' type assertions
  code = code.replace(/\s+as\s+\w+/g, '');
  
  // Remove type imports
  code = code.replace(/import\s+type\s*{[^}]+}\s*from\s*['"][^'"]+['"]/g, '');
  
  return code;
}

function transformCode(code) {
  let transformed = code;
  
  // Transform default exports
  transformed = transformed.replace(
    /export\s+default\s+function\s+(\w+)/g, 
    'module.exports.default = function $1'
  );
  
  transformed = transformed.replace(
    /export\s+default\s+/g, 
    'module.exports.default = '
  );
  
  // Transform named exports - handle both forms
  transformed = transformed.replace(
    /export\s+const\s+(\w+)/g,
    'const $1'
  );
  
  transformed = transformed.replace(
    /export\s+{\s*([^}]+)\s*}/g,
    (match, exports) => {
      return exports.split(',').map((exp) => {
        const name = exp.trim();
        return `module.exports.${name} = ${name};`;
      }).join('\n');
    }
  );
  
  // Transform imports (fix double semicolon issue)
  transformed = transformed.replace(
    /import\s+React(?:,\s*{([^}]+)})?\s+from\s+['"]react['"]\s*;?/g,
    (match, namedImports) => {
      if (namedImports) {
        return `const React = require('react');\nconst {${namedImports}} = React;`;
      }
      return `const React = require('react');`;
    }
  );
  
  transformed = transformed.replace(
    /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    'const {$1} = require("$2");'
  );
  
  transformed = transformed.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    'const $1 = require("$2");'
  );
  
  return transformed;
}

function findExportedNames(code) {
  const names = [];
  
  // Find all const/function/class declarations after they've been transformed
  const constMatches = code.matchAll(/const\s+(\w+)\s*=/g);
  for (const match of constMatches) {
    // Check if this was originally exported by looking at the original position
    names.push(match[1]);
  }
  
  return names;
}

async function testTransform() {
  try {
    const buttonPath = path.join(__dirname, 'packages/fractal-registry/Button.tsx');
    const source = fs.readFileSync(buttonPath, 'utf-8');
    
    console.log('=== ORIGINAL SOURCE ===');
    console.log(source);
    console.log('\n');
    
    // Track originally exported names
    const exportedNames = [];
    const exportConstRegex = /export\s+const\s+(\w+)/g;
    let match;
    while ((match = exportConstRegex.exec(source)) !== null) {
      exportedNames.push(match[1]);
    }
    
    // Transform
    const cleanSource = source.replace(FRACTAL_MARKER, '');
    const jsCode = stripTypeScript(cleanSource);
    const transformed = transformCode(jsCode);
    
    // Add exports for named exports
    let finalTransformed = transformed;
    for (const name of exportedNames) {
      finalTransformed += `\nmodule.exports.${name} = ${name};`;
    }
    
    const finalOutput = `${finalTransformed}

if (module.exports && module.exports.default) {
  module.exports.default.__fractalId = "Button";
}`;
    
    console.log('=== FIXED TRANSFORM OUTPUT ===');
    console.log(finalOutput);
    
    // Test syntax
    try {
      const testFunc = new Function('module', 'exports', 'require', finalOutput);
      console.log('\n✅ Fixed transform produces valid syntax!');
      
      // Test execution
      const mockModule = { exports: {} };
      const mockRequire = (name) => {
        if (name === 'react') {
          return { 
            createElement: (type, props, ...children) => ({ type, props, children })
          };
        }
        return {};
      };
      
      testFunc(mockModule, mockModule.exports, mockRequire);
      console.log('\n=== MODULE EXPORTS ===');
      console.log(mockModule.exports);
      
    } catch (syntaxError) {
      console.error('❌ Syntax Error in fixed transform:');
      console.error(syntaxError.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTransform();