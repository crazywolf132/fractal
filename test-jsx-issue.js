// The issue is in the JSX transformation
// Current output:
const broken = `React.createElement('button', { onClick: onClick, style: {
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    ...styles[variant], }, text)`;

// Should be:
const correct = `React.createElement('button', { onClick: onClick, style: {
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    ...styles[variant]
  }}, text)`;

console.log('The issue is that the style object is not properly closed before adding text as the third argument.');
console.log('Missing closing brace for the props object');