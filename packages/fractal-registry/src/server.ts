import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import { fractalRouter } from './routes/fractals';
import { FractalStore } from './store';

const app: Express = express();
const port = process.env.PORT || 3001;

export const fractalStore = new FractalStore();

app.use(cors());
app.use(express.json());
app.use('/fractals', fractalRouter);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Registry: http://localhost:${port}`);
  });
}

export default app;