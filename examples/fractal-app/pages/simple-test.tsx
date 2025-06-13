import { useEffect, useState } from 'react';

export default function SimpleTest() {
  const [status, setStatus] = useState('Starting...');
  const [fractalData, setFractalData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  
  useEffect(() => {
    const testFractal = async () => {
      try {
        setStatus('Fetching fractal metadata...');
        const metaRes = await fetch('http://localhost:3001/fractals/button-fractal');
        const meta = await metaRes.json();
        setFractalData(meta);
        setStatus('Metadata fetched successfully');
        
        setStatus('Fetching fractal code...');
        const codeRes = await fetch(meta.url);
        const code = await codeRes.text();
        
        setStatus('Code fetched, evaluating...');
        // Set React globally
        (window as any).React = await import('react');
        
        try {
          const moduleExports = eval(code);
          console.log('Module exports:', moduleExports);
          setStatus('Success! Check console for module exports');
        } catch (evalErr) {
          setError(evalErr);
          setStatus('Eval error');
        }
      } catch (err) {
        setError(err);
        setStatus('Fetch error');
      }
    };
    
    testFractal();
  }, []);
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Simple Fractal Test</h1>
      <p>Status: {status}</p>
      
      {fractalData && (
        <div>
          <h3>Fractal Metadata:</h3>
          <pre>{JSON.stringify(fractalData, null, 2)}</pre>
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red' }}>
          <h3>Error:</h3>
          <pre>{error.toString()}</pre>
          <pre>{error.stack}</pre>
        </div>
      )}
    </div>
  );
}