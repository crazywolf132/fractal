import { FractalProvider, Fractal } from '@fractal/core';

export default function InlineTest() {
  return (
    <FractalProvider registry="http://localhost:3001">
      <div style={{ padding: '2rem' }}>
        <h1>Inline Test - With Provider</h1>
        
        <div style={{ border: '2px solid blue', padding: '1rem', margin: '1rem 0' }}>
          <h3>Direct Fractal Usage</h3>
          <Fractal 
            id="button-fractal" 
            props={{ text: 'Inline Test Button' }}
            fallback={<div style={{ color: 'red' }}>LOADING...</div>}
          />
        </div>
        
        <p>This page has its own FractalProvider to test if the context is the issue.</p>
      </div>
    </FractalProvider>
  );
}