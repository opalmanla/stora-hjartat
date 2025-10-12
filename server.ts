import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const { default: apiRoutes } = await import('./src/backend/routes.ts');

app.use('/api', apiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Servern körs på http://localhost:3000');
});
