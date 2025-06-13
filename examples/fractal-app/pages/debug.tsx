import { useFractal } from '@fractal/core';
import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'loading' | 'ok' | 'error';
  message?: string;
}

const StatusIndicator = ({ health }: { health: HealthStatus }) => (
  <div style={{ 
    padding: '1rem', 
    borderRadius: '4px',
    background: health.status === 'ok' ? '#d4edda' : health.status === 'error' ? '#f8d7da' : '#fff3cd',
    border: `1px solid ${health.status === 'ok' ? '#c3e6cb' : health.status === 'error' ? '#f5c6cb' : '#ffeaa7'}`
  }}>
    Status: {health.status}
    {health.message && <div>Message: {health.message}</div>}
  </div>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
    {children}
  </pre>
);

export default function DebugPage() {
  const [registryData, setRegistryData] = useState<any>(null);
  const [health, setHealth] = useState<HealthStatus>({ status: 'loading' });
  const module = useFractal('button-fractal');
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const checkRegistry = async () => {
      try {
        const [fractalRes, healthRes] = await Promise.all([
          fetch('http://localhost:3001/fractals/button-fractal'),
          fetch('http://localhost:3001/health')
        ]);

        if (fractalRes.ok) {
          const data = await fractalRes.json();
          setRegistryData(data);
        }

        if (healthRes.ok) {
          setHealth({ status: 'ok' });
        } else {
          setHealth({ status: 'error', message: `HTTP ${healthRes.status}` });
        }
      } catch (error) {
        setHealth({ 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };

    checkRegistry();
  }, []);
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Fractal Debug Console</h1>
      
      <section style={{ marginTop: '2rem' }}>
        <h3>Module State</h3>
        <CodeBlock>{JSON.stringify(module, null, 2)}</CodeBlock>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Registry Health</h3>
        <StatusIndicator health={health} />
      </section>

      {registryData && (
        <section style={{ marginTop: '2rem' }}>
          <h3>Registry Response</h3>
          <CodeBlock>{JSON.stringify(registryData, null, 2)}</CodeBlock>
        </section>
      )}
    </div>
  );
}