const fs = require('fs');
const path = require('path');

// Import the transform function
const { transformFractal } = require('./packages/fractal-registry/dist/transform.js');

async function testTransform() {
  try {
    // Read the Button.tsx component
    const buttonPath = path.join(__dirname, 'packages/fractal-registry/Button.tsx');
    const source = fs.readFileSync(buttonPath, 'utf-8');
    
    console.log('=== ORIGINAL SOURCE ===');
    console.log(source);
    console.log('\n');
    
    // Transform the component
    const transformed = await transformFractal(source, 'Button');
    
    console.log('=== TRANSFORMED OUTPUT ===');
    console.log(transformed);
    console.log('\n');
    
    // Try to parse the transformed code to check for syntax errors
    try {
      // Create a function to evaluate the transformed code
      const testFunc = new Function('module', 'exports', 'require', transformed);
      console.log('✅ Transformed code is syntactically valid!');
      
      // Test execution in a mock environment
      const mockModule = { exports: {} };
      const mockRequire = (name) => {
        if (name === 'react') {
          return { createElement: () => {} };
        }
        return {};
      };
      
      testFunc(mockModule, mockModule.exports, mockRequire);
      console.log('\n=== MODULE EXPORTS ===');
      console.log(mockModule.exports);
      
    } catch (syntaxError) {
      console.error('❌ Syntax Error in transformed code:');
      console.error(syntaxError.message);
      console.error('\nError location:', syntaxError.stack);
    }
    
  } catch (error) {
    console.error('Error during transformation:', error.message);
    console.error(error.stack);
  }
}

testTransform();