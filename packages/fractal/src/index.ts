import React, { createContext, useContext, useEffect, useState } from 'react';
import { registerModule } from './module-registry';

export { registerModule } from './module-registry';
export * from './types';

const cache = new Map<string, any>();
const pending = new Map<string, Promise<any>>();
const RegistryContext = createContext<string>('');

async function loadModule(url: string): Promise<any> {
  const response = await fetch(url);
  const code = await response.text();
  
  (window as any).React = React;
  (window as any).react = React;
  try {
    return eval(code);
  } finally {
    delete (window as any).React;
    delete (window as any).react;
  }
}

export const FractalProvider: React.FC<{ registry: string; children: React.ReactNode }> = ({ 
  registry, 
  children 
}) => React.createElement(RegistryContext.Provider, { value: registry }, children);

export function useFractal(id: string) {
  const registry = useContext(RegistryContext);
  const [module, setModule] = useState(() => cache.get(id));

  useEffect(() => {
    if (!registry || cache.has(id)) return;

    const existing = pending.get(id);
    if (existing) {
      existing.then(setModule);
      return;
    }

    const promise = fetch(`${registry}/fractals/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(async ({ url, styles }) => {
        const module = await loadModule(url);
        const result = { 
          Component: module.default || module,
          styles 
        };
        cache.set(id, result);
        pending.delete(id);
        return result;
      })
      .catch(() => {
        pending.delete(id);
        return null;
      });

    pending.set(id, promise);
    promise.then(setModule);
  }, [id, registry]);

  return module;
}

export const Fractal: React.FC<{ 
  id: string; 
  props?: any; 
  fallback?: React.ReactNode 
}> = ({ id, props = {}, fallback = null }) => {
  const module = useFractal(id);
  
  if (!module) return React.createElement(React.Fragment, null, fallback);
  
  const { Component, styles } = module;
  
  return React.createElement(
    React.Fragment,
    null,
    styles && React.createElement('style', { dangerouslySetInnerHTML: { __html: styles } }),
    React.createElement(Component, props)
  );
};

export function preload(registry: string, ...ids: string[]) {
  ids.forEach(id => {
    if (cache.has(id)) return;
    
    fetch(`${registry}/fractals/${id}`)
      .then(res => res.json())
      .then(({ url }) => loadModule(url))
      .catch(() => {});
  });
}