import express from 'express';
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

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
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
    app.use(errorHandler);

    return app;
}

const app = createApp();
export default app;
