import { spawn } from 'child_process';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const isTsx = Boolean(process.env.TSX_ACTIVE || process.execArgv.some((a) => a.includes('tsx')));

if (!isTsx) {
  process.env.TSX_ACTIVE = 'true';
  const child = spawn(
    process.execPath,
    ['--import=tsx', fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    {
      stdio: 'inherit',
      env: process.env,
    }
  );
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
} else {
  const getRouter = (route: any) => {
    const resolved = route?.default ?? route;

    if (typeof resolved !== 'function') {
      throw new Error(
        `Invalid Express router import. Expected a router function, got ${typeof resolved}`
      );
    }

    return resolved;
  };

  const getAppDirname = () => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.url) {
        return path.dirname(fileURLToPath(import.meta.url));
      }
    } catch {
      // Fallback if import.meta.url is not a string
    }
    return process.cwd();
  };

  const appDir = getAppDirname();

  // Load environment variables from backend/.env and root .env
  dotenv.config({ path: path.join(appDir, 'backend', '.env') });
  dotenv.config();

  const startServer = async () => {
    const { createServer: createViteServer } = await import('vite');
    const { connectDB, getDBStatus } = await import('./backend/config/db');
    const authRoutes = (await import('./backend/routes/authRoutes')).default;
    const productRoutes = (await import('./backend/routes/productRoutes')).default;
    const blockchainRoutes = (await import('./backend/routes/blockchainRoutes')).default;
    const predictionRoutes = (await import('./backend/routes/predictionRoutes')).default;

    const app = express();
    const PORT = 3000;

    // Initialize MongoDB Atlas connection asynchronously (falls back to resilient in-memory storage)
    connectDB().catch(() => {
      // Handled gracefully inside connectDB
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
          endpoints: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
        },
        products: {
          endpoints: [
            'POST /api/products (Register Produce with JWT)',
            'GET /api/products (All verified batches from MongoDB Atlas)',
            'GET /api/products/my-produce (Farmer batches with JWT)',
            'GET /api/products/:batchId (Public verification)',
          ],
        },
      });
    });

    // Mount API routes
    app.use('/api/auth', getRouter(authRoutes));
    app.use('/api/products', getRouter(productRoutes));
    app.use('/api/blockchain', getRouter(blockchainRoutes));
    app.use('/api/predict', getRouter(predictionRoutes));

    // Database offline error middleware fallback
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (
        err?.name === 'MongooseError' ||
        err?.name === 'MongoNetworkError' ||
        err?.message?.includes('buffering timed out')
      ) {
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
  };

  startServer().catch((err) => {
    console.error('Fatal server boot error:', err);
  });
}
