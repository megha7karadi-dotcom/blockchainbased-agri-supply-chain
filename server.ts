import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env and root .env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
dotenv.config();

import { createServer as createViteServer } from 'vite';
import { connectDB, getDBStatus } from './backend/config/db';
import authRoutes from './backend/routes/authRoutes';
import productRoutes from './backend/routes/productRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize MongoDB Atlas connection asynchronously
  connectDB().catch((err) => {
    console.warn('MongoDB Atlas initial connection notice:', err?.message || err);
  });

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health and Diagnostic API route
  app.get('/api/health', (req, res) => {
    const dbStatus = getDBStatus();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AgriTrace API & Traceability Engine',
      database: dbStatus,
      auth: {
        type: 'JWT',
        endpoints: ['/api/auth/register', '/api/auth/login', '/api/auth/me']
      },
      products: {
        endpoints: [
          'POST /api/products (Register Produce with JWT)',
          'GET /api/products (All verified batches from MongoDB Atlas)',
          'GET /api/products/my-produce (Farmer batches with JWT)',
          'GET /api/products/:batchId (Public verification)'
        ]
      }
    });
  });

  // Mount API routes
  const authRouter = (authRoutes as any)?.default || authRoutes;
  const productRouter = (productRoutes as any)?.default || productRoutes;

  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);

  // Database offline error middleware fallback
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.name === 'MongooseError' || err?.name === 'MongoNetworkError' || err?.message?.includes('buffering timed out')) {
      console.warn('[AI Studio] Database offline — returning mock fallback response');
      if (req.method === 'GET') {
        return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
      }
      return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 AgriTrace Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
