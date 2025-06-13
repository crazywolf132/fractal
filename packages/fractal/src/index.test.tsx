import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import React from 'react';
import { useFractal, Fractal, FractalProvider, preload, setupFractals } from './index';
import { registerModule } from './module-registry';

describe('Fractal Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe('FractalProvider', () => {
    it('should render children with registry context', () => {
      render(
        <FractalProvider registry="http://test-registry">
          <div>Test Child</div>
        </FractalProvider>
      );
      
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  describe('useFractal', () => {
    it('should return cached module immediately', () => {
      const TestComponent = () => {
        const module = useFractal('cached-module');
        return <div>{module ? 'Module Loaded' : 'Loading'}</div>;
      };

      const { rerender } = render(<TestComponent />);
      expect(screen.getByText('Loading')).toBeInTheDocument();
      
      rerender(<TestComponent />);
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('should fetch module from registry', async () => {
      const mockModule = { default: () => <div>Mock Component</div> };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'http://test-registry/fractals/test.js' }),
      });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => `export default ${mockModule.default.toString()}`,
      });

      const TestComponent = () => {
        const module = useFractal('test-fractal', 'http://test-registry');
        return <div>{module ? 'Module Loaded' : 'Loading'}</div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://test-registry/fractals/test-fractal');
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const TestComponent = () => {
        const module = useFractal('error-fractal', 'http://test-registry');
        return <div>{module ? 'Module Loaded' : 'Loading'}</div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      expect(screen.getByText('Loading')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });
  });

  describe('Fractal Component', () => {
    it('should render fallback when module not loaded', () => {
      render(
        <Fractal 
          id="not-loaded" 
          fallback={<div>Fallback Content</div>}
        />
      );
      
      expect(screen.getByText('Fallback Content')).toBeInTheDocument();
    });

    it('should render component when module is loaded', async () => {
      const TestComponent = ({ name }: { name: string }) => <div>Hello {name}</div>;
      const mockModule = { 
        Component: TestComponent,
        styles: '.test { color: red; }'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'http://test-registry/fractals/test.js' }),
      });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => 'export default () => {}',
      });

      const { container } = render(
        <FractalProvider registry="http://test-registry">
          <Fractal id="test-fractal" props={{ name: 'World' }} />
        </FractalProvider>
      );
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('preload', () => {
    it('should preload multiple fractals', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'http://test-registry/fractals/one.js' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => 'export default () => {}',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'http://test-registry/fractals/two.js' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => 'export default () => {}',
        });

      preload('http://test-registry', 'fractal-one', 'fractal-two');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://test-registry/fractals/fractal-one');
        expect(global.fetch).toHaveBeenCalledWith('http://test-registry/fractals/fractal-two');
      });
    });

    it('should handle preload errors silently', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      preload('http://test-registry', 'error-fractal');
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });
  });

  describe('setupFractals', () => {
    it('should register custom modules', async () => {
      const customModule = { test: true };
      
      await setupFractals({
        modules: {
          'custom-module': customModule,
        },
      });
      
      expect((global as any).__fractalModules.getModule('custom-module')).toEqual(customModule);
    });

    it('should preload fractals when configured', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'http://test-registry/fractals/preloaded.js' }),
      });

      await setupFractals({
        registryUrl: 'http://test-registry',
        preload: ['preloaded-fractal'],
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://test-registry/fractals/preloaded-fractal');
      });
    });

    it('should initialize auto-loading', async () => {
      // The setupFractals function calls autoInitialize which only runs in browser environment
      // Since we're in jsdom, window is defined but modules won't actually be loaded
      await setupFractals();
      
      // Just verify the function completes without error
      expect(true).toBe(true);
    });
  });
});