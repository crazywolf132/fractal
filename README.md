# Fractal - Module Federation System for React Components

Fractal is a powerful module federation system that enables sharing and dynamic loading of React components across applications. It provides a complete ecosystem for building, distributing, and consuming modular React components with rich metadata and dependency tracking.

## 🚀 What are Fractals?

**Fractals** are self-contained React components that can be:
- Built and distributed independently
- Loaded dynamically at runtime
- Shared across multiple applications
- Tracked with comprehensive metadata including dependencies, repository info, and versioning

Think of fractals as "micro-frontends at the component level" - they enable true component-level modularity and reuse.

## 🏗️ Architecture

The Fractal system consists of four main packages:

- **[@fractal/core](./packages/fractal)** - Runtime component loader and React integration
- **[@fractal/cli](./packages/fractal-cli)** - Build tool for compiling and distributing fractals
- **[@fractal/registry](./packages/fractal-registry)** - HTTP API for serving fractal components and metadata
- **[fractal-demo-app](./examples/fractal-app)** - Example Next.js app demonstrating fractal usage

## 🎯 Key Features

### For Component Authors
- **Zero-config creation** - Just add `"use fractal"` to any React component
- **Advanced building** - esbuild-powered compilation with dependency analysis
- **Rich metadata** - Automatic generation of manifests with git info, dependencies, and more
- **Package-aware naming** - Automatic naming based on package.json context

### For Component Consumers  
- **Runtime loading** - Dynamic component loading with caching and error handling
- **Type safety** - Full TypeScript support
- **Dependency tracking** - Automatic resolution of internal fractal dependencies
- **Production security** - Secure registry with configurable upload restrictions

## 🏃‍♂️ Quick Start

### 1. Prerequisites
```bash
# Install Node.js 18+ and pnpm
npm install -g pnpm
```

### 2. Setup
```bash
# Clone and install dependencies
git clone <repository>
cd mod-fed-next
pnpm install

# Build all packages
pnpm build
```

### 3. Start Development Environment
```bash
# Start registry, CLI, and demo app
pnpm dev
```

This starts:
- **Registry** on http://localhost:3001 - Serves fractal components
- **Demo App** on http://localhost:3000 - Example Next.js application  
- **CLI** in watch mode - Monitors for package changes
- **Core** in watch mode - Runtime library development

### 4. Build and Upload Example Fractals
```bash
# Build fractals with CLI and upload to registry
cd examples/fractal-app
pnpm build:fractals

# Or use watch mode for development
pnpm watch:fractals
```

### 5. View the Demo
Visit http://localhost:3000 to see fractals in action!

## 📝 Creating Fractals

### 1. Create a Component File
```tsx
// components/MyButton.tsx
"use fractal";

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function MyButton({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
      style={{
        background: variant === 'primary' ? '#007bff' : '#6c757d',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
}
```

### 2. Build the Fractal
```bash
# Build all fractals in current directory and subdirectories
fractal build

# Build with custom output and registry upload
fractal build -o ./dist/fractals --registry http://localhost:3001

# Watch for changes and rebuild automatically
fractal build --watch
```

### 3. Generated Files
The CLI generates several files for each fractal:
- `my-package-my-button-1-0-0.js` - Compiled component code
- `my-package-my-button-1-0-0.manifest.json` - Rich metadata manifest
- `my-package-my-button-1-0-0.meta.json` - Build metadata

## 🔧 Using Fractals

### Loading Fractals in Your App

```tsx
import React from 'react';
import { Fractal } from '@fractal/core';

function MyApp() {
  return (
    <div>
      <h1>My Application</h1>
      
      {/* Load a fractal component */}
      <Fractal 
        id="my-package::my-button::1.0.0"
        props={{ 
          children: "Click me!",
          onClick: () => alert('Fractal clicked!'),
          variant: "primary"
        }}
        loading={<div>Loading button...</div>}
        error={<div>Failed to load button</div>}
      />
      
      {/* Load multiple fractals */}
      <Fractal 
        id="ui-lib::card::2.1.0"
        props={{ title: "Hello", content: "This is a card fractal" }}
      />
    </div>
  );
}
```

### Setup Fractal Registry
```tsx
// In your app's entry point or _app.tsx
import { setupFractals } from '@fractal/core';

setupFractals({
  registryUrl: 'http://localhost:3001',
  // Optional: preload specific fractals
  preload: ['my-package::my-button::1.0.0']
});
```

## 📊 Fractal Manifests

Each fractal generates a comprehensive manifest with:

```json
{
  "name": "my-package::my-button::1.0.0",
  "version": "1.0.0", 
  "generationDate": "2025-06-13T10:30:00.000Z",
  "dependencies": {
    "production": { "react": "^18.0.0" },
    "development": { "@types/react": "^18.0.0" },
    "peer": { "react-dom": "^18.0.0" }
  },
  "internalFractals": ["my-package::icon::1.0.0"],
  "repository": {
    "url": "https://github.com/user/my-project",
    "branch": "main", 
    "commit": "abc123...",
    "dirty": false
  },
  "parentApplication": {
    "name": "my-package",
    "version": "1.0.0",
    "path": "/path/to/package.json"
  },
  "source": {
    "filePath": "/absolute/path/to/MyButton.tsx",
    "relativePath": "components/MyButton.tsx"  
  }
}
```

## 🛠️ Development Workflow

### Package Structure
```
my-app/
├── package.json              # Contains name and version for fractal naming
├── components/
│   ├── Button.tsx            # "use fractal" component
│   ├── Card.tsx              # "use fractal" component  
│   └── Icon.tsx              # Regular component (no directive)
└── dist/fractals/            # Built fractals output
    ├── my-app-button-1-0-0.js
    ├── my-app-button-1-0-0.manifest.json
    ├── my-app-card-1-0-0.js
    └── my-app-card-1-0-0.manifest.json
```

### Development Commands
```bash
# Build fractals once
pnpm build:fractals

# Watch and rebuild on changes  
pnpm watch:fractals

# Start development environment
pnpm dev              # All services
pnpm dev:registry     # Registry only  
pnpm dev:app          # Demo app only
pnpm dev:cli          # CLI in watch mode
```

## 🔒 Production Deployment

### Registry Security
The registry includes production security features:

```bash
# Production mode - uploads disabled by default
NODE_ENV=production pnpm start

# Override to allow uploads (e.g., in CI/CD)
NODE_ENV=production FRACTAL_ALLOW_UPLOADS=true pnpm start
```

### Build Pipeline Integration
```bash
# CI/CD script example
fractal build -o ./dist/fractals
# Upload built fractals to production registry
fractal build -o ./dist/fractals --registry https://my-fractal-registry.com
```

## 📡 Registry API

### Endpoints

#### Get Fractal Info
```http
GET /fractals/{id}
```
Returns fractal metadata including code URL and manifest URL.

#### Get Fractal Code  
```http
GET /fractals/{id}/code
```
Returns executable JavaScript code for the fractal.

#### Get Fractal Manifest
```http
GET /fractals/{id}/manifest  
```
Returns the complete manifest with dependencies and metadata.

#### Upload Fractal (Development)
```http
POST /fractals/{id}
Content-Type: application/json

{
  "source": "fractal source code...",
  "manifest": { ... }
}
```

#### Health Check
```http
GET /health
```

## 🎯 Examples

Check out the [demo app](./examples/fractal-app) for complete examples:

- **Button Component** - Basic fractal with props and styling
- **Card Component** - Fractal with complex layout and multiple props  
- **Navigation Component** - Fractal that uses other fractals internally
- **Styled Card** - Fractal with CSS-in-JS styling

Visit the demo pages:
- http://localhost:3000 - Main demo page
- http://localhost:3000/compose - Component composition examples
- http://localhost:3000/debug - Development debugging tools

## 🧹 Maintenance Commands

```bash
# Clean all build artifacts
pnpm clean

# Clean and reinstall dependencies  
pnpm clean && pnpm install

# Run tests (when available)
pnpm test

# Check workspace health
pnpm build    # Should build all packages successfully
```

## 🚀 Next Steps

1. **Create your first fractal** - Add `"use fractal"` to a React component
2. **Build and test** - Use `fractal build --watch` for development
3. **Integrate with your app** - Use `<Fractal>` component to load fractals
4. **Deploy to production** - Set up a production fractal registry
5. **Share across teams** - Enable component sharing across applications

---

**Happy fractal building!** 🎉

For more detailed documentation, check the individual package READMEs or explore the example application.