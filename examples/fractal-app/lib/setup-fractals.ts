import { registerModule } from '@fractal/core';

const modules = {
  'next/navigation': () => import('next/navigation'),
  'next/link': () => import('next/link'),
  'next/image': () => import('next/image'),
  'next/router': () => import('next/router'),
  'next/head': () => import('next/head'),
  'next/dynamic': () => import('next/dynamic'),
  'next/script': () => import('next/script'),
  'react': () => import('react'),
  'react-dom': () => import('react-dom'),
};

if (typeof window !== 'undefined') {
  Object.entries(modules).forEach(([name, loader]) => {
    loader().then(m => {
      registerModule(name, m);
      console.log(`Registered module: ${name}`);
    }).catch(err => {
      console.warn(`Failed to register module ${name}:`, err);
    });
  });
}