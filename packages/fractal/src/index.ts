import React, { createContext, useContext, useEffect, useState } from 'react';
import { registerModule } from './module-registry';

export { registerModule } from './module-registry';
export * from './types';

const cache = new Map<string, any>();
const pending = new Map<string, Promise<any>>();

// Auto-detect registry URL with smart defaults
const detectRegistryUrl = (): string => {
  // 1. Environment variable (for both build-time and runtime)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FRACTAL_REGISTRY_URL) {
    return process.env.NEXT_PUBLIC_FRACTAL_REGISTRY_URL;
  }
  
  // 2. Client-side environment variable check
  if (typeof window !== 'undefined') {
    const env = (window as any).__ENV__ || {};
    if (env.FRACTAL_REGISTRY_URL) {
      return env.FRACTAL_REGISTRY_URL;
    }
  }
  
  // 3. Default based on environment
  const defaultPort = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ? 8080 : 3001;
  const protocol = (typeof window !== 'undefined' && window.location?.protocol) || 'http:';
  const hostname = (typeof window !== 'undefined' && window.location?.hostname) || 'localhost';
  
  return `${protocol}//${hostname}:${defaultPort}`;
};

const DEFAULT_REGISTRY = detectRegistryUrl();
const RegistryContext = createContext<string>(DEFAULT_REGISTRY);

// Auto-initialization system
const autoInitialize = (() => {
  let initialized = false;
  let initPromise: Promise<void> | null = null;
  
  return () => {
    if (initialized) return Promise.resolve();
    if (initPromise) return initPromise;
    
    initPromise = (async () => {
      if (typeof window === 'undefined') return;
      
      // Detect framework and register appropriate modules
      const modules: Record<string, () => Promise<any>> = {
        'react': () => import('react'),
        'react-dom': () => import('react-dom'),
      };
      
      // Next.js detection and module registration
      if ((window as any).next || (window as any).__NEXT_DATA__) {
        Object.assign(modules, {
          'next/navigation': () => import('next/navigation'),
          'next/link': () => import('next/link'),
          'next/image': () => import('next/image'),
          'next/router': () => import('next/router'),
          'next/head': () => import('next/head'),
          'next/dynamic': () => import('next/dynamic'),
          'next/script': () => import('next/script'),
        });
      }
      
      // Register all detected modules
      await Promise.allSettled(
        Object.entries(modules).map(async ([name, loader]) => {
          try {
            const module = await loader();
            registerModule(name, module);
          } catch (err) {
            console.warn(`Auto-registration failed for ${name}:`, err);
          }
        })
      );
      
      initialized = true;
    })();
    
    return initPromise;
  };
})();

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

export function useFractal(id: string, registry?: string) {
  const contextRegistry = useContext(RegistryContext);
  const effectiveRegistry = registry || contextRegistry;
  const [module, setModule] = useState(() => cache.get(id));

  useEffect(() => {
    if (!effectiveRegistry || cache.has(id)) return;

    const existing = pending.get(id);
    if (existing) {
      existing.then(setModule);
      return;
    }

    // Auto-initialize before loading fractals
    const promise = autoInitialize()
      .then(() => fetch(`${effectiveRegistry}/fractals/${id}`))
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
  }, [id, effectiveRegistry]);

  return module;
}

export const Fractal: React.FC<{ 
  id: string; 
  props?: any; 
  fallback?: React.ReactNode;
  registry?: string;
}> = ({ id, props = {}, fallback = null, registry }) => {
  const module = useFractal(id, registry);
  
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

// Backward compatibility and explicit setup function
export function setupFractals(config?: { 
  registryUrl?: string; 
  preload?: string[];
  modules?: Record<string, any>;
}) {
  if (config?.modules) {
    Object.entries(config.modules).forEach(([name, module]) => {
      registerModule(name, module);
    });
  }
  
  if (config?.preload && config?.registryUrl) {
    preload(config.registryUrl, ...config.preload);
  }
  
  // Force initialization if not already done
  return autoInitialize();
}