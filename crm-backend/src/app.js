import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authRoutes from './api/routes/auth.routes.js';
import publicRoutes from './api/routes/public.routes.js';
import adminRoutes from './api/routes/admin.routes.js';
import notificationRoutes from './api/routes/notification.routes.js';
import * as documentController from './api/controllers/document.controller.js';
import { prismaMiddleware } from './config/prisma.js';

const app = new Hono();

// --- CORS must be FIRST so headers are present on ALL responses (including errors) ---
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*'; // Allow non-browser requests (curl, etc.)
    const allowed = [
      'http://localhost:5173', 'http://localhost:4173', 
      'http://localhost:5174', 'http://localhost:4173',
      'http://127.0.0.1:5173', 'http://127.0.0.1:4173',
      'http://127.0.0.1:5174', 'http://127.0.0.1:4173',
      'https://suryakiran-solar.onrender.com',
      'https://varcas-energy.pages.dev',
      'https://varcas-energy-crm.pages.dev',
    ];
    // Allow exact matches or any *.pages.dev subdomain (for preview deployments)
    if (allowed.includes(origin) || /\.pages\.dev$/.test(origin)) {
      return origin;
    }
    return allowed[0]; // Fallback
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// --- Prisma middleware AFTER cors ---
app.use('*', prismaMiddleware);

// --- Health Check ---
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Routes ---
app.get('/files/*', documentController.getFile);

app.route('/api/auth', authRoutes);
app.route('/api', publicRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/notifications', notificationRoutes);

// --- Global Error Handler ---
app.onError((err, c) => {
  console.error('Global Error:', err.stack || err.message);
  return c.json({ message: err.message || 'Internal Server Error' }, err.status || 500);
});

// --- 404 handler ---
app.notFound((c) => {
  return c.json({ message: 'Not Found' }, 404);
});

export default app;
