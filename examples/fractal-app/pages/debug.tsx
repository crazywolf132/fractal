import { useFractal } from '@fractal/core';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [error, setError] = useState<string | null>(null);
  const module = useFractal('button-fractal');
  
  useEffect(() => {
    console.log('Module state:', module);
    
    // Test registry endpoint
    fetch('http://localhost:3001/fractals/button-fractal')
      .then(res => res.json())
      .then(data => console.log('Registry response:', data))
      .catch(err => {
        console.error('Registry error:', err);
        setError(err.message);
      });
  }, [module]);
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Debug Page</h1>
      
      <div style={{ marginTop: '1rem' }}>
        <h3>Module State:</h3>
        <pre>{JSON.stringify(module, null, 2)}</pre>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
      
      <div style={{ marginTop: '1rem' }}>
        <h3>Registry Health Check:</h3>
        <iframe src="http://localhost:3001/health" />
      </div>
    </div>
  );
}