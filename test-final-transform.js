const { transformFractal } = require('./packages/fractal-registry/dist/transform');

const buttonSource = `"use fractal";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ text, onClick, variant = 'primary' }: ButtonProps) {
  const styles = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        ...styles[variant],
      }}
    >
      {text}
    </button>
  );
}`;

async function test() {
  try {
    const result = await transformFractal(buttonSource, 'button-test');
    console.log('=== TRANSFORMED CODE ===');
    console.log(result);
    console.log('\n=== TESTING WITH Function CONSTRUCTOR ===');
    
    // Test if it can be parsed
    try {
      const fn = new Function('module', 'exports', 'require', result);
      console.log('✅ Code can be parsed successfully!');
    } catch (e) {
      console.error('❌ Parse error:', e.message);
      
      // Find the line with the error
      const lines = result.split('\n');
      lines.forEach((line, i) => {
        if (line.includes(':')) {
          console.log(`Line ${i + 1}: ${line}`);
        }
      });
    }
  } catch (error) {
    console.error('Transform error:', error);
  }
}

test();