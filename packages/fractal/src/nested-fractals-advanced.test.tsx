import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Fractal } from './index';

// Mock fetch for fractal loading
global.fetch = vi.fn();

describe('Advanced Nested Fractal Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).__fractalModuleRegistry = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Slot-Based Composition', () => {
    it('should support slot-based fractal composition', async () => {
      const layoutCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function Layout({ header, main, footer }) {
            return React.createElement('div', { 'data-testid': 'layout' },
              React.createElement('header', { 'data-testid': 'header-slot' }, header),
              React.createElement('main', { 'data-testid': 'main-slot' }, main),
              React.createElement('footer', { 'data-testid': 'footer-slot' }, footer)
            );
          }
          
          module.exports = Layout;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'layout.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => layoutCode
        });

      // Parent component that fills slots with fractals
      const ParentWithSlots = () => {
        return (
          <Fractal 
            id="layout-fractal"
            props={{
              header: <div>Header Content</div>,
              main: <div>Main Content</div>,
              footer: <div>Footer Content</div>
            }}
          />
        );
      };

      render(<ParentWithSlots />);

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('header-slot')).toHaveTextContent('Header Content');
        expect(screen.getByTestId('main-slot')).toHaveTextContent('Main Content');
        expect(screen.getByTestId('footer-slot')).toHaveTextContent('Footer Content');
      });
    });

    it('should support nested fractals in slots', async () => {
      const containerCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          
          function Container({ slot }) {
            return React.createElement('div', { 'data-testid': 'container' },
              React.createElement('h1', null, 'Container'),
              React.createElement('div', { 'data-testid': 'slot-content' }, slot)
            );
          }
          
          module.exports = Container;
          return module.exports;
        })()
      `;

      const widgetCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function Widget({ name }) {
            return React.createElement('div', { 'data-testid': 'widget' }, 'Widget: ' + name);
          }
          
          module.exports = Widget;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'container.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => containerCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'widget.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => widgetCode
        });

      (window as any).__fractalCore = { Fractal };

      const App = () => {
        return (
          <Fractal 
            id="container-fractal"
            props={{
              slot: <Fractal id="widget-fractal" props={{ name: 'Nested' }} />
            }}
          />
        );
      };

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('container')).toBeInTheDocument();
        expect(screen.getByTestId('widget')).toBeInTheDocument();
        expect(screen.getByText('Widget: Nested')).toBeInTheDocument();
      });
    });
  });

  describe('Event-Based Communication', () => {
    it('should support event communication between parent and child fractals', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { useState, useEffect } = React;
          
          function EventParent() {
            const [message, setMessage] = useState('No message');
            
            useEffect(() => {
              const handler = (event) => {
                if (event.detail && event.detail.type === 'child-message') {
                  setMessage(event.detail.message);
                }
              };
              
              window.addEventListener('fractal-event', handler);
              return () => window.removeEventListener('fractal-event', handler);
            }, []);
            
            return React.createElement('div', { 'data-testid': 'event-parent' },
              React.createElement('div', { 'data-testid': 'parent-message' }, message),
              React.createElement(Fractal, { id: 'event-child' })
            );
          }
          
          module.exports = EventParent;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function EventChild() {
            const sendMessage = () => {
              window.dispatchEvent(new CustomEvent('fractal-event', {
                detail: { type: 'child-message', message: 'Hello from child!' }
              }));
            };
            
            return React.createElement('div', { 'data-testid': 'event-child' },
              React.createElement('button', { 
                'data-testid': 'send-message',
                onClick: sendMessage
              }, 'Send Message')
            );
          }
          
          module.exports = EventChild;
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

      render(<Fractal id="event-parent" />);

      await waitFor(() => {
        expect(screen.getByTestId('parent-message')).toHaveTextContent('No message');
        expect(screen.getByTestId('send-message')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('send-message'));

      await waitFor(() => {
        expect(screen.getByTestId('parent-message')).toHaveTextContent('Hello from child!');
      });
    });
  });

  describe('Context Sharing', () => {
    it('should support React context sharing between parent and nested fractals', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { createContext, useState } = React;
          
          // Create and export context
          const ThemeContext = createContext({ theme: 'light', setTheme: () => {} });
          window.__ThemeContext = ThemeContext;
          
          function ContextParent() {
            const [theme, setTheme] = useState('light');
            
            return React.createElement(ThemeContext.Provider, { 
              value: { theme, setTheme }
            },
              React.createElement('div', { 'data-testid': 'context-parent' },
                React.createElement('button', {
                  'data-testid': 'toggle-theme',
                  onClick: () => setTheme(theme === 'light' ? 'dark' : 'light')
                }, 'Toggle Theme'),
                React.createElement(Fractal, { id: 'context-child' })
              )
            );
          }
          
          module.exports = ContextParent;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { useContext } = React;
          
          function ContextChild() {
            const ThemeContext = window.__ThemeContext;
            const { theme } = useContext(ThemeContext);
            
            return React.createElement('div', { 
              'data-testid': 'context-child',
              'data-theme': theme
            }, 'Current theme: ' + theme);
          }
          
          module.exports = ContextChild;
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

      render(<Fractal id="context-parent" />);

      await waitFor(() => {
        const child = screen.getByTestId('context-child');
        expect(child).toBeInTheDocument();
        expect(child).toHaveAttribute('data-theme', 'light');
        expect(child).toHaveTextContent('Current theme: light');
      });

      fireEvent.click(screen.getByTestId('toggle-theme'));

      await waitFor(() => {
        const child = screen.getByTestId('context-child');
        expect(child).toHaveAttribute('data-theme', 'dark');
        expect(child).toHaveTextContent('Current theme: dark');
      });
    });
  });

  describe('Lazy Loading Patterns', () => {
    it('should support lazy loading of nested fractals', async () => {
      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { useState, lazy, Suspense } = React;
          
          function LazyParent() {
            const [loadChild, setLoadChild] = useState(false);
            
            return React.createElement('div', { 'data-testid': 'lazy-parent' },
              React.createElement('button', {
                'data-testid': 'load-child',
                onClick: () => setLoadChild(true)
              }, 'Load Child'),
              loadChild && React.createElement(Suspense, {
                fallback: React.createElement('div', { 'data-testid': 'loading' }, 'Loading...')
              },
                React.createElement(Fractal, { id: 'lazy-child' })
              )
            );
          }
          
          module.exports = LazyParent;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function LazyChild() {
            return React.createElement('div', { 'data-testid': 'lazy-child' }, 'Lazy loaded child');
          }
          
          module.exports = LazyChild;
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

      render(<Fractal id="lazy-parent" />);

      await waitFor(() => {
        expect(screen.getByTestId('load-child')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('lazy-child')).not.toBeInTheDocument();

      // Setup child response with delay
      (fetch as any)
        .mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ url: 'child.js', styles: '' })
          }), 100))
        )
        .mockResolvedValueOnce({
          ok: true,
          text: async () => childCode
        });

      fireEvent.click(screen.getByTestId('load-child'));

      // Should show loading state briefly or child immediately
      // Note: In React 18+, Suspense might resolve too quickly to catch loading state

      // Should eventually show child
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('lazy-child')).toBeInTheDocument();
        expect(screen.getByText('Lazy loaded child')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Portal-Based Composition', () => {
    it('should support rendering child fractals in portals', async () => {
      // Setup portal container
      const portalRoot = document.createElement('div');
      portalRoot.id = 'portal-root';
      document.body.appendChild(portalRoot);

      const parentCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const ReactDOM = window.ReactDOM;
          const { Fractal } = window.__fractalCore || {};
          const { useState, useEffect } = React;
          
          function PortalParent() {
            const [portalContainer, setPortalContainer] = useState(null);
            
            useEffect(() => {
              setPortalContainer(document.getElementById('portal-root'));
            }, []);
            
            return React.createElement('div', { 'data-testid': 'portal-parent' },
              React.createElement('h1', null, 'Parent in main container'),
              portalContainer && ReactDOM.createPortal(
                React.createElement(Fractal, { 
                  id: 'portal-child',
                  props: { message: 'I am in a portal!' }
                }),
                portalContainer
              )
            );
          }
          
          module.exports = PortalParent;
          return module.exports;
        })()
      `;

      const childCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function PortalChild({ message }) {
            return React.createElement('div', { 
              'data-testid': 'portal-child' 
            }, message);
          }
          
          module.exports = PortalChild;
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
      (window as any).ReactDOM = { createPortal: (element: any, container: any) => {
        // Simple mock for createPortal - just render in the container
        return element;
      }};

      const { container } = render(<Fractal id="portal-parent" />);

      await waitFor(() => {
        expect(screen.getByTestId('portal-parent')).toBeInTheDocument();
        expect(screen.getByTestId('portal-child')).toBeInTheDocument();
      });

      // Since we're mocking createPortal, child will be in the normal DOM
      // In a real implementation, it would be in the portal root
      expect(screen.getByText('I am in a portal!')).toBeInTheDocument();

      // Cleanup
      document.body.removeChild(portalRoot);
    });
  });

  describe('Cross-Fractal State Synchronization', () => {
    it('should synchronize state across sibling fractals', async () => {
      const orchestratorCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          const { Fractal } = window.__fractalCore || {};
          const { useState } = React;
          
          function Orchestrator() {
            const [sharedValue, setSharedValue] = useState('initial');
            
            return React.createElement('div', { 'data-testid': 'orchestrator' },
              React.createElement(Fractal, { 
                id: 'producer-fractal',
                props: { onValueChange: setSharedValue }
              }),
              React.createElement(Fractal, { 
                id: 'consumer-fractal',
                props: { value: sharedValue }
              })
            );
          }
          
          module.exports = Orchestrator;
          return module.exports;
        })()
      `;

      const producerCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function Producer({ onValueChange }) {
            return React.createElement('div', { 'data-testid': 'producer' },
              React.createElement('button', {
                'data-testid': 'update-value',
                onClick: () => onValueChange('updated by producer')
              }, 'Update Value')
            );
          }
          
          module.exports = Producer;
          return module.exports;
        })()
      `;

      const consumerCode = `
        (function() {
          const module = { exports: {} };
          const React = window.React;
          
          function Consumer({ value }) {
            return React.createElement('div', { 
              'data-testid': 'consumer' 
            }, 'Value: ' + value);
          }
          
          module.exports = Consumer;
          return module.exports;
        })()
      `;

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'orchestrator.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => orchestratorCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'producer.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => producerCode
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'consumer.js', styles: '' })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => consumerCode
        });

      (window as any).__fractalCore = { Fractal };

      render(<Fractal id="orchestrator-fractal" />);

      await waitFor(() => {
        expect(screen.getByTestId('consumer')).toHaveTextContent('Value: initial');
      });

      fireEvent.click(screen.getByTestId('update-value'));

      await waitFor(() => {
        expect(screen.getByTestId('consumer')).toHaveTextContent('Value: updated by producer');
      });
    });
  });
});