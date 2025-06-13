import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { fractalStore } from '../server';

export const fractalRouter: RouterType = Router();

fractalRouter.get('/:id', async (req, res) => {
  const fractal = await fractalStore.getFractal(req.params.id);
  
  if (!fractal) {
    return res.status(404).json({ error: 'Not found' });
  }

  const { protocol, host } = req;
  res.json({
    url: `${protocol}://${host}/fractals/${req.params.id}/code`,
    styles: fractal.styles
  });
});

fractalRouter.get('/:id/code', async (req, res) => {
  const fractal = await fractalStore.getFractal(req.params.id);
  
  if (!fractal) {
    return res.status(404).send('');
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

  res.type('application/javascript').send(code);
});

fractalRouter.post('/:id', async (req, res) => {
  const { source } = req.body;
  
  if (!source) {
    return res.status(400).json({ error: 'Source required' });
  }

  const fractal = await fractalStore.addFractal(req.params.id, source);
  res.json({ id: fractal.id, createdAt: fractal.createdAt });
});