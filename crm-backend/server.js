import dotenv from 'dotenv';
dotenv.config();

import { serve } from '@hono/node-server';
import app from './src/app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`CRM backend listening on port ${info.port}`);
});
