import { Hono } from 'hono';
import { fractalStore } from '../server';

export const fractalRouter = new Hono();

fractalRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const fractal = await fractalStore.getFractal(id);
  
  if (!fractal) {
    return c.json({ error: 'Not found' }, 404);
  }

  const url = new URL(c.req.url);
  return c.json({
    url: `${url.protocol}//${url.host}/fractals/${id}/code`,
    manifestUrl: `${url.protocol}//${url.host}/fractals/${id}/manifest`,
    styles: fractal.styles,
    hasManifest: !!fractal.manifest
  });
});

fractalRouter.get('/:id/code', async (c) => {
  const id = c.req.param('id');
  const fractal = await fractalStore.getFractal(id);
  
  if (!fractal) {
    return c.text('', 404);
  }

  const code = `(function() {
    const module = { exports: {} };
    const exports = module.exports;
    const React = window.React;
    const require = (name) => 
      name === 'react' ? window.React : 
      window.__fractalModules?.getModule(name) || {};
    
    ${fractal.compiled}
    
    return module.exports;
  })()`;

  return c.text(code, 200, {
    'Content-Type': 'application/javascript'
  });
});

fractalRouter.get('/:id/manifest', async (c) => {
  const id = c.req.param('id');
  const fractal = await fractalStore.getFractal(id);
  
  if (!fractal) {
    return c.json({ error: 'Not found' }, 404);
  }

  if (!fractal.manifest) {
    return c.json({ error: 'Manifest not available' }, 404);
  }

  return c.json(fractal.manifest);
});

fractalRouter.post('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { source, manifest } = body;
  
  if (!source) {
    return c.json({ error: 'Source required' }, 400);
  }

  const fractal = await fractalStore.addFractal(id, source, manifest);
  return c.json({ 
    id: fractal.id, 
    createdAt: fractal.createdAt,
    hasManifest: !!fractal.manifest
  });
});