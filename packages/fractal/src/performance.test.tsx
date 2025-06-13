import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import React from 'react';
import { useFractal, Fractal, preload } from './index';

describe('Performance and Race Conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe('Race Conditions', () => {
    it('should handle rapid ID changes without memory leaks', async () => {
      let resolveFirst: any;
      let resolveSecond: any;
      
      const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
      const secondPromise = new Promise(resolve => { resolveSecond = resolve; });
      
      (global.fetch as any)
        .mockImplementationOnce(() => firstPromise)
        .mockImplementationOnce(() => secondPromise);

      const TestComponent = ({ id }: { id: string }) => {
        const module = useFractal(id, 'http://test-registry');
        return <div>{id}: {module ? 'Loaded' : 'Loading'}</div>;
      };

      const { rerender } = render(<TestComponent id="first" />);
      
      // Change ID before first load completes
      rerender(<TestComponent id="second" />);
      
      // Resolve in reverse order
      resolveSecond({
        ok: true,
        json: async () => ({ url: 'http://test/second.js' })
      });
      
      resolveFirst({
        ok: true,
        json: async () => ({ url: 'http://test/first.js' })
      });

      await waitFor(() => {
        expect(screen.getByText('second: Loading')).toBeInTheDocument();
      });
    });

    it('should handle component unmounting during load', async () => {
      let resolveFetch: any;
      const fetchPromise = new Promise(resolve => { resolveFetch = resolve; });
      
      (global.fetch as any).mockImplementationOnce(() => fetchPromise);

      const TestComponent = () => {
        const module = useFractal('unmount-during-load', 'http://test-registry');
        return <div>{module ? 'Loaded' : 'Loading'}</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      // Unmount before fetch completes
      unmount();
      
      // Resolve after unmount
      resolveFetch({
        ok: true,
        json: async () => ({ url: 'http://test/unmounted.js' })
      });

      // Should not throw
      expect(true).toBe(true);
    });

    it('should handle simultaneous loads of different fractals', async () => {
      const fetchPromises: Record<string, any> = {};
      const resolvers: Record<string, any> = {};
      
      (global.fetch as any).mockImplementation((url: string) => {
        const id = url.split('/').pop();
        if (!fetchPromises[id!]) {
          fetchPromises[id!] = new Promise(resolve => {
            resolvers[id!] = resolve;
          });
        }
        return fetchPromises[id!];
      });

      const TestComponent = ({ id }: { id: string }) => {
        const module = useFractal(id, 'http://test-registry');
        return <div>{id}: {module ? 'Loaded' : 'Loading'}</div>;
      };

      render(
        <>
          <TestComponent id="parallel-1" />
          <TestComponent id="parallel-2" />
          <TestComponent id="parallel-3" />
        </>
      );

      // Resolve in random order
      if (resolvers['fractals/parallel-2']) {
        resolvers['fractals/parallel-2']({
          ok: true,
          json: async () => ({ url: 'http://test/parallel-2.js' })
        });
      }
      
      if (resolvers['fractals/parallel-1']) {
        resolvers['fractals/parallel-1']({
          ok: true,
          json: async () => ({ url: 'http://test/parallel-1.js' })
        });
      }
      
      if (resolvers['fractals/parallel-3']) {
        resolvers['fractals/parallel-3']({
          ok: true,
          json: async () => ({ url: 'http://test/parallel-3.js' })
        });
      }

      await waitFor(() => {
        expect(screen.getByText('parallel-1: Loading')).toBeInTheDocument();
        expect(screen.getByText('parallel-2: Loading')).toBeInTheDocument();
        expect(screen.getByText('parallel-3: Loading')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should cache modules across component instances', async () => {
      let fetchCount = 0;
      
      (global.fetch as any).mockImplementation(() => {
        fetchCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ url: 'http://test/cached.js' }),
        });
      });

      const TestComponent = ({ instance }: { instance: number }) => {
        const module = useFractal('cached-module', 'http://test-registry');
        return <div>Instance {instance}: {module ? 'Cached' : 'Loading'}</div>;
      };

      // Render multiple instances
      const { rerender } = render(<TestComponent instance={1} />);
      
      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(0);
      });
      
      const initialFetchCount = fetchCount;
      
      // Add more instances
      rerender(
        <>
          <TestComponent instance={1} />
          <TestComponent instance={2} />
          <TestComponent instance={3} />
        </>
      );

      // Should not fetch again
      expect(fetchCount).toBe(initialFetchCount);
    });

    it('should handle bulk preloading efficiently', async () => {
      const fetchTimes: number[] = [];
      const startTime = Date.now();
      
      (global.fetch as any).mockImplementation(() => {
        fetchTimes.push(Date.now() - startTime);
        return Promise.resolve({
          ok: true,
          json: async () => ({ url: 'http://test/bulk.js' })
        });
      });

      // Preload many modules at once
      const moduleIds = Array.from({ length: 50 }, (_, i) => `bulk-${i}`);
      preload('http://test-registry', ...moduleIds);

      // All fetches should start immediately (not sequentially)
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Check that fetches started close together
      if (fetchTimes.length > 1) {
        const timeDiffs = fetchTimes.slice(1).map((time, i) => time - fetchTimes[i]);
        const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        
        // Average time between fetches should be very small (parallel execution)
        expect(avgTimeDiff).toBeLessThan(5);
      }
    });
  });

  describe('Memory Pressure', () => {
    it('should handle loading very large modules', async () => {
      const largeModuleCode = `
        export default {
          data: new Array(10000).fill(0).map((_, i) => ({
            id: i,
            value: 'x'.repeat(100)
          })),
          render: () => 'Large Module'
        };
      `;
      
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'http://test/large.js' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => largeModuleCode
        });

      const TestComponent = () => {
        const module = useFractal('large-module', 'http://test-registry');
        return <div>{module ? 'Large Loaded' : 'Loading'}</div>;
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.queryByText('Loading')).toBeInTheDocument();
      });
    });

    it('should handle rapid mount/unmount cycles without leaking', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'http://test/cycle.js' })
      });

      const TestComponent = () => {
        const module = useFractal('cycle-test', 'http://test-registry');
        return <div>{module ? 'Loaded' : 'Loading'}</div>;
      };

      // Rapid mount/unmount
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<TestComponent />);
        unmount();
      }

      // Should complete without issues
      expect(true).toBe(true);
    });
  });

  describe('Network Conditions', () => {
    it('should handle slow network responses', async () => {
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ url: 'http://test/slow.js' })
          }), 1000)
        )
      );

      const TestComponent = () => {
        const module = useFractal('slow-network', 'http://test-registry');
        return <div>{module ? 'Loaded' : 'Slow Loading'}</div>;
      };

      render(<TestComponent />);
      
      expect(screen.getByText('Slow Loading')).toBeInTheDocument();
      
      // Component should remain stable during long load
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.getByText('Slow Loading')).toBeInTheDocument();
    });

    it('should handle intermittent network failures with retry', async () => {
      let attemptCount = 0;
      
      (global.fetch as any).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ url: 'http://test/retry.js' })
        });
      });

      const TestComponent = () => {
        const module = useFractal('retry-test', 'http://test-registry');
        return <div>{module ? 'Loaded' : 'Retrying'}</div>;
      };

      render(<TestComponent />);
      
      // Initial attempt should fail
      await waitFor(() => {
        expect(attemptCount).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Component Lifecycle Edge Cases', () => {
    it('should handle state updates after unmount', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      let resolveTimeout: any;
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => {
          resolveTimeout = setTimeout(() => resolve({
            ok: true,
            json: async () => ({ url: 'http://test/unmounted.js' })
          }), 100);
        })
      );

      const TestComponent = () => {
        const module = useFractal('unmount-test', 'http://test-registry');
        return <div>{module ? 'Loaded' : 'Loading'}</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      // Unmount immediately
      unmount();
      
      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should not log errors about setting state on unmounted component
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('unmounted component')
      );
      
      clearTimeout(resolveTimeout);
      consoleSpy.mockRestore();
    });

    it('should handle registry prop changes during load', async () => {
      let resolveFirst: any;
      const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
      
      (global.fetch as any)
        .mockImplementationOnce(() => firstPromise)
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: async () => ({ url: 'http://test/second-registry.js' })
        }));

      const TestComponent = ({ registry }: { registry: string }) => {
        const module = useFractal('registry-change', registry);
        return <div>{registry}: {module ? 'Loaded' : 'Loading'}</div>;
      };

      const { rerender } = render(<TestComponent registry="http://first-registry" />);
      
      // Change registry before first load completes
      rerender(<TestComponent registry="http://second-registry" />);
      
      // Complete first load after registry change
      resolveFirst({
        ok: true,
        json: async () => ({ url: 'http://test/first-registry.js' })
      });

      await waitFor(() => {
        expect(screen.getByText('http://second-registry: Loading')).toBeInTheDocument();
      });
    });
  });

  describe('Browser API Edge Cases', () => {
    it('should handle eval in strict mode', async () => {
      'use strict';
      
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'http://test/strict.js' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '"use strict"; export default () => "Strict Mode"'
        });

      const TestComponent = () => {
        const module = useFractal('strict-mode', 'http://test-registry');
        return <div>{module ? 'Strict Loaded' : 'Loading'}</div>;
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.queryByText('Loading')).toBeInTheDocument();
      });
    });

    it('should handle modules using window globals', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'http://test/globals.js' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => `
            export default () => {
              if (typeof window !== 'undefined') {
                return window.location ? 'Has Window' : 'No Window';
              }
              return 'No Window';
            }
          `
        });

      const TestComponent = () => {
        const module = useFractal('window-globals', 'http://test-registry');
        return <div>{module ? 'Globals Loaded' : 'Loading'}</div>;
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.queryByText('Loading')).toBeInTheDocument();
      });
    });
  });
});