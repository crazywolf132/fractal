# Fractal - Zero-Config Module Federation for Next.js

Fractal is a lightweight, zero-configuration module federation system specifically designed for Next.js and React applications. It allows you to create reusable components that can be dynamically loaded at runtime without any complex configuration.

## Features

- **Zero Configuration**: Just add `"use fractal"` to any React component
- **Runtime Loading**: Components are loaded dynamically from a central registry
- **Next.js Integration**: Full support for Next.js routing, SSR, and navigation
- **Automatic Detection**: Build-time detection and transformation of fractal components
- **Type Safety**: Full TypeScript support

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Packages

```bash
pnpm build
```

### 3. Start Everything

```bash
pnpm dev
```

This will start:
- Core package in watch mode
- Plugin package in watch mode  
- Registry server on http://localhost:3001
- Demo app on http://localhost:3000 (after registry is ready)

### 4. Upload Example Fractals (First Time Only)

```bash
pnpm upload-fractals
```

This uploads the example fractal components to the registry.

## Creating a Fractal Component

```tsx
"use fractal";

export default function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}
```

## Using Fractal Components

```tsx
import { Fractal } from '@fractal/core';

function App() {
  return (
    <Fractal 
      id="my-component" 
      props={{ title: "Hello Fractal!" }}
      loading={<div>Loading...</div>}
    />
  );
}
```

## Architecture

- **@fractal/core**: Runtime loader and React components
- **@fractal/plugin**: Next.js/webpack plugin for build-time processing
- **@fractal/registry**: REST API for serving fractal components

## How It Works

1. Components with `"use fractal"` are detected at build time
2. They're transformed and uploaded to the registry
3. Apps can load these components dynamically using the `<Fractal>` component
4. The loader handles caching, error handling, and dependency management

## Available Commands

### Development
- `pnpm dev` - Start all services in development mode
- `pnpm dev:registry` - Start only the registry server
- `pnpm dev:app` - Start only the demo app

### Build
- `pnpm build` - Build all packages and apps
- `pnpm build:packages` - Build only the packages
- `pnpm build:apps` - Build only the example apps

### Production
- `pnpm start` - Start registry and app in production mode

### Maintenance
- `pnpm clean` - Clean all build artifacts and node_modules
- `pnpm test` - Run tests (placeholder for now)