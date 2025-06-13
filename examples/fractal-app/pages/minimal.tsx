export default function MinimalTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Minimal Test</h1>
      <p>Check console for errors</p>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          console.log('Window React:', window.React);
          console.log('Window __fractalModules:', window.__fractalModules);
          
          // Test fractal loading manually
          (async () => {
            try {
              const res = await fetch('http://localhost:3001/fractals/button-fractal');
              const meta = await res.json();
              console.log('Fractal metadata:', meta);
              
              const codeRes = await fetch(meta.url);
              const code = await codeRes.text();
              console.log('Code length:', code.length);
              
              // Test eval
              window.React = await import('react');
              const module = eval(code);
              console.log('Module loaded:', module);
            } catch (err) {
              console.error('Error:', err);
            }
          })();
        `
      }} />
    </div>
  );
}