import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const port = 3000;

async function main() {
  const app = express();
  app.use(express.json());
  const { default: apiRoutes } = await import('./src/backend/routes.ts');
  app.use('/api', apiRoutes);
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: __dirname,
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(resolve(__dirname, 'dist/client')));
    app.get(/.*/, (_req, res) => {
      res.sendFile(resolve(__dirname, 'dist/client/index.html'));
    });
  }
  app.listen(port, () => {
    console.log(`Server körs på http://localhost:${port}`);
  });
}

main().catch((error) => console.error(error));