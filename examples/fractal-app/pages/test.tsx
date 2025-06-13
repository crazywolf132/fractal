import { Fractal } from '@fractal/core';

export default function TestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Page</h1>
      <p>Testing fractal loading...</p>
      
      <div style={{ border: '1px solid red', padding: '1rem', marginTop: '1rem' }}>
        <h3>Button Fractal Test</h3>
        <Fractal 
          id="button-fractal" 
          props={{ text: 'Test Button', onClick: () => console.log('Clicked!') }}
          fallback={<div>Loading button...</div>}
        />
      </div>
    </div>
  );
}