import React, { createContext, useContext, useEffect, useState } from 'react';
import { registerModule } from './module-registry';

export { registerModule } from './module-registry';
export * from './types';

const fractalCache = new Map<string, any>();
const pendingLoads = new Map<string, Promise<any>>();

const detectRegistryUrl = (): string => 
  process.env?.NEXT_PUBLIC_FRACTAL_REGISTRY_URL ||
  (typeof window !== 'undefined' && (window as any).__ENV__?.FRACTAL_REGISTRY_URL) ||
  `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:${process.env?.NODE_ENV === 'production' ? 8080 : 3001}`;

const RegistryContext = createContext<string>(detectRegistryUrl());

let initPromise: Promise<void> | null = null;

async function autoInitialize(): Promise<void> {
  if (initPromise) return initPromise;
  
  initPromise = performInitialization();
  return initPromise;
}

async function performInitialization(): Promise<void> {
  if (typeof window === 'undefined') return;

  const modules: Record<string, () => Promise<any>> = {
    'react': () => import('react'),
    'react-dom': () => import('react-dom'),
  };

  const isNextJs = typeof window !== 'undefined' && 
                   ((window as any).next || (window as any).__NEXT_DATA__);
                   
  if (isNextJs) {
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

  await Promise.allSettled(
    Object.entries(modules).map(async ([name, loader]) => {
      try {
        const module = await loader();
        registerModule(name, module);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to register module ${name}:`, error);
        }
      }
    })
  );
}

async function loadModule(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load module: ${response.status} ${response.statusText}`);
  }

  const code = await response.text();
  
  (window as any).React = React;
  (window as any).react = React;
  
  try {
    // The fractal code is already wrapped in an IIFE that returns module.exports
    // We use Function constructor to avoid using eval
    // The code expects window.React to be available
    const moduleFunction = new Function('window', 'React', `
      // Make window the global context for the fractal code
      with (window) {
        return ${code};
      }
    `);
    return moduleFunction(window, React);
  } finally {
    delete (window as any).React;
    delete (window as any).react;
  }
}

export const FractalProvider: React.FC<{ 
  registry: string; 
  children: React.ReactNode;
}> = ({ registry, children }) => (
  <RegistryContext.Provider value={registry}>
    {children}
  </RegistryContext.Provider>
);

export function useFractal(id: string, registry?: string) {
  const contextRegistry = useContext(RegistryContext);
  const effectiveRegistry = registry || contextRegistry;
  const [module, setModule] = useState(() => fractalCache.get(id));

  useEffect(() => {
    if (!effectiveRegistry || fractalCache.has(id)) return;

    const existingPromise = pendingLoads.get(id);
    if (existingPromise) {
      existingPromise.then(setModule);
      return;
    }

    const loadFractal = async () => {
      try {
        await autoInitialize();
        
        const response = await fetch(`${effectiveRegistry}/fractals/${id}`);
        if (!response.ok) {
          throw new Error(`Fractal not found: ${id}`);
        }

        const { url, styles } = await response.json();
        const moduleCode = await loadModule(url);
        
        const result = { 
          Component: moduleCode.default || moduleCode,
          styles 
        };
        
        fractalCache.set(id, result);
        pendingLoads.delete(id);
        return result;
      } catch (error) {
        pendingLoads.delete(id);
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to load fractal ${id}:`, error);
        }
        return null;
      }
    };

    const promise = loadFractal();
    pendingLoads.set(id, promise);
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
  
  if (!module) {
    return <>{fallback}</>;
  }
  
  const { Component, styles } = module;
  
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <Component {...props} />
    </>
  );
};

export function preload(registry: string, ...ids: string[]): void {
  ids.forEach(async (id) => {
    if (fractalCache.has(id)) return;
    
    try {
      const response = await fetch(`${registry}/fractals/${id}`);
      if (response.ok) {
        const { url } = await response.json();
        await loadModule(url);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to preload fractal ${id}:`, error);
      }
    }
  });
}

export function setupFractals(config?: { 
  registryUrl?: string; 
  preload?: string[];
  modules?: Record<string, any>;
}): Promise<void> {
  if (config?.modules) {
    Object.entries(config.modules).forEach(([name, module]) => {
      registerModule(name, module);
    });
  }
  
  if (config?.preload && config?.registryUrl) {
    preload(config.registryUrl, ...config.preload);
  }
  
  return autoInitialize();
}