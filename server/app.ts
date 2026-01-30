import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiV1Router from './api/v1/index';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validation';
import { logger } from './utils/logger';

/**
 * Express app with API only (no Vite, no static files).
 * Used by: server/index.ts (dev with Vite) and Vercel serverless handler.
 */
export function createApp(): express.Express {
    const app = express();

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));

    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true
    }));

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again later'
    });
    app.use('/api/', limiter);

    // On Vercel, req.body may already be set by the platform — skip parsing to avoid crash
    app.use((req, res, next) => {
        if (process.env.VERCEL && req.body !== undefined) return next();
        express.json()(req, res, next);
    });
    app.use((req, res, next) => {
        if (process.env.VERCEL && req.body !== undefined) return next();
        express.urlencoded({ extended: true })(req, res, next);
    });
    app.use(sanitizeInput);

    app.use((req, res, next) => {
        logger.info('Incoming request', {
            method: req.method,
            url: req.url,
            ip: req.ip
        });
        next();
    });

    app.use('/api/v1', apiV1Router);

    // On Vercel: serve static + SPA fallback (root server.ts is the entry; no api/ handler)
    if (process.env.VERCEL) {
        const dist = path.join(process.cwd(), 'dist');
        app.use(express.static(dist));
        app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
    }

    app.use(errorHandler);

    return app;
}

const app = createApp();
export default app;
