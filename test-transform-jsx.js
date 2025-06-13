const fs = require('fs');
const path = require('path');

// Simple JSX to React.createElement transformer
function transformJSX(code) {
  // This is a very simplified JSX transformer for testing
  // In production, you'd use a proper parser like Babel
  
  // Transform self-closing tags
  code = code.replace(/<(\w+)([^>]*?)\/>/g, (match, tag, attrs) => {
    const props = attrs.trim() ? `{${attrs}}` : 'null';
    return `React.createElement('${tag}', ${props})`;
  });
  
  // Transform opening/closing tags with children
  code = code.replace(/<(\w+)([^>]*?)>([^<]*)<\/\1>/g, (match, tag, attrs, children) => {
    const props = attrs.trim() ? `{${attrs}}` : 'null';
    const childrenStr = children.trim() ? `, '${children.trim()}'` : '';
    return `React.createElement('${tag}', ${props}${childrenStr})`;
  });
  
  // Transform JSX expressions {children}
  code = code.replace(/>\s*{([^}]+)}\s*</g, '>, $1, <');
  
  return code;
}

async function testTransform() {
  try {
    const buttonPath = path.join(__dirname, 'packages/fractal-registry/Button.tsx');
    const source = fs.readFileSync(buttonPath, 'utf-8');
    
    // For this test, let's manually create what the transform SHOULD produce
    const expectedOutput = `const React = require('react');

module.exports.default = function Button({ children, onClick, variant = 'primary' }) {
  return React.createElement('button', {
    onClick: onClick,
    className: \`btn btn-\${variant}\`
  }, children);
}

const ButtonGroup = ({ children }) => {
  return React.createElement('div', { className: "button-group" }, children);
};

module.exports.ButtonGroup = ButtonGroup;

if (module.exports && module.exports.default) {
  module.exports.default.__fractalId = "Button";
}`;
    
    console.log('=== EXPECTED TRANSFORM OUTPUT ===');
    console.log(expectedOutput);
    
    // Test the expected output
    try {
      const testFunc = new Function('module', 'exports', 'require', expectedOutput);
      console.log('\n✅ Expected output is syntactically valid!');
      
      // Test execution
      const mockModule = { exports: {} };
      const mockRequire = (name) => {
        if (name === 'react') {
          return { 
            createElement: (type, props, ...children) => ({ 
              type, 
              props, 
              children: children.length === 1 ? children[0] : children 
            })
          };
        }
        return {};
      };
      
      testFunc(mockModule, mockModule.exports, mockRequire);
      
      console.log('\n=== MODULE EXPORTS ===');
      console.log('Default export (Button):', typeof mockModule.exports.default);
      console.log('Button.__fractalId:', mockModule.exports.default.__fractalId);
      console.log('Named export (ButtonGroup):', typeof mockModule.exports.ButtonGroup);
      
      // Test the components
      console.log('\n=== TESTING COMPONENTS ===');
      const Button = mockModule.exports.default;
      const ButtonGroup = mockModule.exports.ButtonGroup;
      
      const buttonResult = Button({ children: 'Click me', onClick: () => {}, variant: 'primary' });
      console.log('Button render result:', JSON.stringify(buttonResult, null, 2));
      
      const groupResult = ButtonGroup({ children: 'Group content' });
      console.log('ButtonGroup render result:', JSON.stringify(groupResult, null, 2));
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    console.log('\n=== ISSUES TO FIX IN transform.ts ===');
    console.log('1. The regex /<[^>]+>/g for removing generics is too broad and removes JSX tags');
    console.log('2. Type annotation removal needs to handle object type patterns like ": { children: React.ReactNode }"');
    console.log('3. Import transformation creates double semicolons');
    console.log('4. Named exports need to be added to module.exports');
    console.log('5. JSX needs to be transformed to React.createElement calls (or use a JSX runtime)');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTransform();