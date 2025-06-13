import { useContext } from 'react';
import React from 'react';

// Import the context directly to test it
const RegistryContext = React.createContext('');

export default function ContextTest() {
  const registry = useContext(RegistryContext);
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Context Test</h1>
      <p>Registry value: {registry || 'NO REGISTRY'}</p>
      <p>Registry type: {typeof registry}</p>
      <p>Registry length: {registry?.length || 0}</p>
    </div>
  );
}