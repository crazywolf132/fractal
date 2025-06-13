import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { fractalRouter } from './routes/fractals';
import { FractalStore } from './store';

const app = new Hono();
const port = Number(process.env.PORT) || 3001;

export const fractalStore = new FractalStore();

app.use('*', cors());
app.route('/fractals', fractalRouter);

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

if (require.main === module) {
  console.log(`Registry: http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;