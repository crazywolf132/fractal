import { useEffect, useState } from 'react';

export default function WindowTest() {
  const [windowInfo, setWindowInfo] = useState<any>({});
  
  useEffect(() => {
    const info = {
      hasFractalModules: !!(window as any).__fractalModules,
      fractalModulesType: typeof (window as any).__fractalModules,
      hasReact: !!(window as any).React,
      reactType: typeof (window as any).React,
      registryUrl: process.env.NEXT_PUBLIC_FRACTAL_REGISTRY_URL || 'http://localhost:3001'
    };
    
    setWindowInfo(info);
    console.log('Window info:', info);
    console.log('Window.__fractalModules:', (window as any).__fractalModules);
  }, []);
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Window Test</h1>
      <pre>{JSON.stringify(windowInfo, null, 2)}</pre>
      
      <h2>Test Fractal Loading</h2>
      <button onClick={async () => {
        try {
          const res = await fetch('http://localhost:3001/fractals/button-fractal');
          const data = await res.json();
          console.log('Fractal metadata:', data);
          
          const codeRes = await fetch(data.url);
          const code = await codeRes.text();
          console.log('Fractal code:', code.substring(0, 200) + '...');
        } catch (err) {
          console.error('Error:', err);
        }
      }}>
        Test Load Fractal
      </button>
    </div>
  );
}