import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Fractal, useFractal } from './index';

// Mock fetch for fractal loading
global.fetch = vi.fn();

describe('Nested Fractals', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset module registry
    (window as any).__fractalModuleRegistry = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Parent-Child Fractal Loading', () => {
    it('should load a parent fractal that contains child fractals', async () => {
      // Mock parent fractal that renders child fractals
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const exports = module.exports;
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function ParentFractal({ title }) {
            return React.createElement('div', { 'data-testid': 'parent-fractal' },
              React.createElement('h1', null, title),
              React.createElement(Fractal, { 
                id: 'child-fractal-1',
                props: { text: 'Child 1' }
              }),
              React.createElement(Fractal, { 
                id: 'child-fractal-2',
                props: { text: 'Child 2' }
              })
            );
          }
          
          module.exports = ParentFractal;
          return module.exports;
        })()
      `;

      const childCode1 = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function ChildFractal1({ text }) {
            return React.createElement('div', { 'data-testid': 'child-1' }, text);
          }
          
          module.exports = ChildFractal1;
          return module.exports;
        })()
      `;

      const childCode2 = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function ChildFractal2({ text }) {
            return React.createElement('div', { 'data-testid': 'child-2' }, text);
          }
          
          module.exports = ChildFractal2;
          return module.exports;
        })()
      `;

      // Mock fetch responses
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child1.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode1
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child2.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode2
        });

      // Make Fractal component available globally for parent fractal
      (window as any).__fractalCore = { Fractal };

      const { container } = render(
        <Fractal id="parent-fractal" props={{ title: 'Parent Component' }} />
      );

      // Wait for parent to load
      await waitFor(() => {
        expect(screen.getByTestId('parent-fractal')).toBeInTheDocument();
      });

      // Wait for children to load
      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
      });

      expect(screen.getByText('Parent Component')).toBeInTheDocument();
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should handle nested fractal loading errors gracefully', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function ParentFractal() {
            return React.createElement('div', { 'data-testid': 'parent' },
              React.createElement('h1', null, 'Parent'),
              React.createElement(Fractal, { 
                id: 'missing-child',
                fallback: React.createElement('div', { 'data-testid': 'child-error' }, 'Child failed to load')
              })
            );
          }
          
          module.exports = ParentFractal;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        });

      (window as any).__fractalCore = { Fractal };

      render(<Fractal id="parent-fractal" />);

      await waitFor(() => {
        expect(screen.getByTestId('parent')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('child-error')).toBeInTheDocument();
        expect(screen.getByText('Child failed to load')).toBeInTheDocument();
      });
    });

    it('should support deeply nested fractals', async () => {
      const level1Code = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function Level1() {
            return React.createElement('div', { 'data-testid': 'level-1' },
              React.createElement('h1', null, 'Level 1'),
              React.createElement(Fractal, { id: 'level-2-fractal' })
            );
          }
          
          module.exports = Level1;
          return module.exports;
        })()
      `;

      const level2Code = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function Level2() {
            return React.createElement('div', { 'data-testid': 'level-2' },
              React.createElement('h2', null, 'Level 2'),
              React.createElement(Fractal, { id: 'level-3-fractal' })
            );
          }
          
          module.exports = Level2;
          return module.exports;
        })()
      `;

      const level3Code = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function Level3() {
            return React.createElement('div', { 'data-testid': 'level-3' }, 'Level 3');
          }
          
          module.exports = Level3;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'level1.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => level1Code
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'level2.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => level2Code
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'level3.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => level3Code
        });

      (window as any).__fractalCore = { Fractal };

      render(<Fractal id="level-1-fractal" />);

      await waitFor(() => {
        expect(screen.getByTestId('level-1')).toBeInTheDocument();
        expect(screen.getByTestId('level-2')).toBeInTheDocument();
        expect(screen.getByTestId('level-3')).toBeInTheDocument();
      });

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
    });
  });

  describe('Parent-Child Communication', () => {
    it('should pass props from parent to child fractals', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function ParentFractal({ theme }) {
            return React.createElement('div', { 'data-testid': 'parent' },
              React.createElement(Fractal, { 
                id: 'themed-child',
                props: { theme: theme, message: 'Hello from parent' }
              })
            );
          }
          
          module.exports = ParentFractal;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function ThemedChild({ theme, message }) {
            return React.createElement('div', { 
              'data-testid': 'themed-child',
              'data-theme': theme 
            }, message);
          }
          
          module.exports = ThemedChild;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode
        });

      (window as any).__fractalCore = { Fractal };

      const { rerender } = render(
        <Fractal id="parent-fractal" props={{ theme: 'light' }} />
      );

      await waitFor(() => {
        const child = screen.getByTestId('themed-child');
        expect(child).toBeInTheDocument();
        expect(child).toHaveAttribute('data-theme', 'light');
        expect(child).toHaveTextContent('Hello from parent');
      });

      // Update parent props
      rerender(<Fractal id="parent-fractal" props={{ theme: 'dark' }} />);

      await waitFor(() => {
        const child = screen.getByTestId('themed-child');
        expect(child).toHaveAttribute('data-theme', 'dark');
      });
    });

    it('should handle state management in parent affecting children', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { useState } = React;
          
          function StatefulParent() {
            const [count, setCount] = useState(0);
            
            return React.createElement('div', { 'data-testid': 'stateful-parent' },
              React.createElement('button', { 
                'data-testid': 'increment',
                onClick: () => setCount(count + 1)
              }, 'Increment'),
              React.createElement(Fractal, { 
                id: 'counter-display',
                props: { count: count }
              })
            );
          }
          
          module.exports = StatefulParent;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function CounterDisplay({ count }) {
            return React.createElement('div', { 'data-testid': 'counter' }, 'Count: ' + count);
          }
          
          module.exports = CounterDisplay;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode
        });

      (window as any).__fractalCore = { Fractal };

      render(<Fractal id="stateful-parent" />);

      await waitFor(() => {
        expect(screen.getByTestId('counter')).toHaveTextContent('Count: 0');
      });

      // Click increment button
      fireEvent.click(screen.getByTestId('increment'));

      await waitFor(() => {
        expect(screen.getByTestId('counter')).toHaveTextContent('Count: 1');
      });
    });
  });

  describe('Dynamic Fractal Composition', () => {
    it('should support conditional rendering of child fractals', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { useState } = React;
          
          function ConditionalParent() {
            const [showChild, setShowChild] = useState(false);
            
            return React.createElement('div', { 'data-testid': 'conditional-parent' },
              React.createElement('button', { 
                'data-testid': 'toggle',
                onClick: () => setShowChild(!showChild)
              }, 'Toggle Child'),
              showChild && React.createElement(Fractal, { 
                id: 'conditional-child',
                props: { message: 'I am visible!' }
              })
            );
          }
          
          module.exports = ConditionalParent;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function ConditionalChild({ message }) {
            return React.createElement('div', { 'data-testid': 'conditional-child' }, message);
          }
          
          module.exports = ConditionalChild;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        });

      (window as any).__fractalCore = { Fractal };

      render(<Fractal id="conditional-parent" />);

      await waitFor(() => {
        expect(screen.getByTestId('toggle')).toBeInTheDocument();
      });

      // Child should not be visible initially
      expect(screen.queryByTestId('conditional-child')).not.toBeInTheDocument();

      // Mock child fractal response
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode
        });

      // Toggle to show child
      fireEvent.click(screen.getByTestId('toggle'));

      await waitFor(() => {
        expect(screen.getByTestId('conditional-child')).toBeInTheDocument();
        expect(screen.getByText('I am visible!')).toBeInTheDocument();
      });

      // Toggle to hide child
      fireEvent.click(screen.getByTestId('toggle'));

      await waitFor(() => {
        expect(screen.queryByTestId('conditional-child')).not.toBeInTheDocument();
      });
    });

    it('should support dynamic fractal ID selection', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { useState } = React;
          
          function DynamicParent() {
            const [fractalType, setFractalType] = useState('type-a');
            
            return React.createElement('div', { 'data-testid': 'dynamic-parent' },
              React.createElement('button', { 
                'data-testid': 'switch-type',
                onClick: () => setFractalType(fractalType === 'type-a' ? 'type-b' : 'type-a')
              }, 'Switch Type'),
              React.createElement(Fractal, { 
                id: fractalType + '-fractal',
                props: { type: fractalType }
              })
            );
          }
          
          module.exports = DynamicParent;
          return module.exports;
        })()
      `;

      const typeACode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function TypeA({ type }) {
            return React.createElement('div', { 'data-testid': 'type-a' }, 'Type A: ' + type);
          }
          
          module.exports = TypeA;
          return module.exports;
        })()
      `;

      const typeBCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function TypeB({ type }) {
            return React.createElement('div', { 'data-testid': 'type-b' }, 'Type B: ' + type);
          }
          
          module.exports = TypeB;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'type-a.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => typeACode
        });

      (window as any).__fractalCore = { Fractal };

      render(<Fractal id="dynamic-parent" />);

      await waitFor(() => {
        expect(screen.getByTestId('type-a')).toBeInTheDocument();
        expect(screen.getByText('Type A: type-a')).toBeInTheDocument();
      });

      // Mock type B response
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'type-b.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => typeBCode
        });

      // Switch type
      fireEvent.click(screen.getByTestId('switch-type'));

      await waitFor(() => {
        expect(screen.queryByTestId('type-a')).not.toBeInTheDocument();
        expect(screen.getByTestId('type-b')).toBeInTheDocument();
        expect(screen.getByText('Type B: type-b')).toBeInTheDocument();
      });
    });
  });

  describe('useFractal Hook in Nested Context', () => {
    it('should allow parent to use useFractal for child components', async () => {
      const ParentWithHook = () => {
        const childA = useFractal('hook-child-a');
        const childB = useFractal('hook-child-b');

        return (
          <div data-testid="parent-with-hooks">
            <h1>Parent Using Hooks</h1>
            {childA && <childA.Component text="Child A via hook" />}
            {childB && <childB.Component text="Child B via hook" />}
          </div>
        );
      };

      const childACode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function ChildA({ text }) {
            return React.createElement('div', { 'data-testid': 'hook-child-a' }, text);
          }
          
          module.exports = ChildA;
          return module.exports;
        })()
      `;

      const childBCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function ChildB({ text }) {
            return React.createElement('div', { 'data-testid': 'hook-child-b' }, text);
          }
          
          module.exports = ChildB;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child-a.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childACode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child-b.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childBCode
        });

      render(<ParentWithHook />);

      await waitFor(() => {
        expect(screen.getByTestId('parent-with-hooks')).toBeInTheDocument();
        expect(screen.getByTestId('hook-child-a')).toBeInTheDocument();
        expect(screen.getByTestId('hook-child-b')).toBeInTheDocument();
      });

      expect(screen.getByText('Child A via hook')).toBeInTheDocument();
      expect(screen.getByText('Child B via hook')).toBeInTheDocument();
    });
  });

  describe('Style Isolation in Nested Fractals', () => {
    it('should maintain style isolation between parent and child fractals', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function StyledParent() {
            return React.createElement('div', { 
              'data-testid': 'styled-parent',
              className: 'parent-style'
            },
              React.createElement('h1', { className: 'title' }, 'Parent Title'),
              React.createElement(Fractal, { id: 'styled-child' })
            );
          }
          
          module.exports = StyledParent;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function StyledChild() {
            return React.createElement('div', { 
              'data-testid': 'styled-child',
              className: 'child-style'
            },
              React.createElement('h2', { className: 'title' }, 'Child Title')
            );
          }
          
          module.exports = StyledChild;
          return module.exports;
        })()
      `;

      const parentStyles = '.parent-style { background: red; } .title { color: blue; }';
      const childStyles = '.child-style { background: green; } .title { color: yellow; }';

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: parentStyles })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child.js', styles: childStyles })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode
        });

      (window as any).__fractalCore = { Fractal };

      const { container } = render(<Fractal id="styled-parent" />);

      await waitFor(() => {
        expect(screen.getByTestId('styled-parent')).toBeInTheDocument();
        expect(screen.getByTestId('styled-child')).toBeInTheDocument();
      });

      // Check that both style tags were injected
      const styleTags = container.ownerDocument.querySelectorAll('style[data-fractal]');
      expect(styleTags.length).toBeGreaterThanOrEqual(2);

      // Verify both components rendered with their classes
      expect(screen.getByTestId('styled-parent')).toHaveClass('parent-style');
      expect(screen.getByTestId('styled-child')).toHaveClass('child-style');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should cleanup child fractals when parent unmounts', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function ParentToUnmount() {
            return React.createElement('div', { 'data-testid': 'parent-unmount' },
              React.createElement(Fractal, { id: 'child-to-cleanup' })
            );
          }
          
          module.exports = ParentToUnmount;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { useEffect } = React;
          
          function ChildToCleanup() {
            useEffect(() => {
              return () => {
                window.__childCleanedUp = true;
              };
            }, []);
            
            return React.createElement('div', { 'data-testid': 'child-cleanup' }, 'Child');
          }
          
          module.exports = ChildToCleanup;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'parent.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => parentCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'child.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode
        });

      (window as any).__fractalCore = { Fractal };
      (window as any).__childCleanedUp = false;

      const { unmount } = render(<Fractal id="parent-unmount" />);

      await waitFor(() => {
        expect(screen.getByTestId('parent-unmount')).toBeInTheDocument();
        expect(screen.getByTestId('child-cleanup')).toBeInTheDocument();
      });

      unmount();

      await waitFor(() => {
        expect((window as any).__childCleanedUp).toBe(true);
      });
    });

    it('should handle circular dependencies gracefully', async () => {
      const fractalACode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { useState } = React;
          
          function FractalA() {
            const [depth, setDepth] = useState(0);
            
            return React.createElement('div', { 'data-testid': 'fractal-a-' + depth },
              React.createElement('span', null, 'A at depth ' + depth),
              depth < 2 && React.createElement(Fractal, { 
                id: 'circular-b',
                props: { depth: depth + 1 }
              })
            );
          }
          
          module.exports = FractalA;
          return module.exports;
        })()
      `;

      const fractalBCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function FractalB({ depth = 0 }) {
            return React.createElement('div', { 'data-testid': 'fractal-b-' + depth },
              React.createElement('span', null, 'B at depth ' + depth),
              depth < 2 && React.createElement(Fractal, { 
                id: 'circular-a',
                props: { depth: depth + 1 }
              })
            );
          }
          
          module.exports = FractalB;
          return module.exports;
        })()
      `;

      let fetchCount = 0;
      (fetch as any).mockImplementation((url: string) => {
        fetchCount++;
        if (fetchCount > 10) {
          throw new Error('Too many fetches - possible infinite loop');
        }

        if (url.includes('circular-a')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ url: 'a.js', styles: '' }),
            text: async () => fractalACode
          });
        } else if (url.includes('circular-b')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ url: 'b.js', styles: '' }),
            text: async () => fractalBCode
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: async () => ({ url: url, styles: '' }),
          text: async () => url.includes('/a.js') ? fractalACode : fractalBCode
        });
      });

      (window as any).__fractalCore = { Fractal };

      render(<Fractal id="circular-a" />);

      await waitFor(() => {
        expect(screen.getByText('A at depth 0')).toBeInTheDocument();
      });

      // Should stop at depth 2
      expect(screen.queryByTestId('fractal-a-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fractal-b-3')).not.toBeInTheDocument();
    });
  });
});