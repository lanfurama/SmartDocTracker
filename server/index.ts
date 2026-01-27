import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiV1Router from './api/v1/index';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validation';
import { logger } from './utils/logger';
import { startBottleneckDetection } from './jobs/bottleneckDetector';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const app = express();
    const PORT = 3000;

    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
    });

    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: false, // Disable for Vite dev mode
        crossOriginEmbedderPolicy: false
    }));

    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later'
    });
    app.use('/api/', limiter);

    // Body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Input sanitization
    app.use(sanitizeInput);

    // Request logging
    app.use((req, res, next) => {
        logger.info('Incoming request', {
            method: req.method,
            url: req.url,
            ip: req.ip
        });
        next();
    });

    // API Routes (must be before Vite middleware to avoid conflicts)
    app.use('/api/v1', apiV1Router);

    // Use vite's connect instance as middleware for static assets
    app.use(vite.middlewares);

    // Serve index.html for root and SPA routes (must be after Vite middleware)
    app.use('*', async (req, res, next) => {
        const url = req.originalUrl;

        try {
            // Read index.html
            const template = await fs.promises.readFile(
                path.resolve(__dirname, '../index.html'),
                'utf-8'
            );
            
            // Transform index.html with Vite
            const html = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            // If there's an error, pass to error handler
            next(e);
        }
    });

    // Global error handler (must be last)
    app.use(errorHandler);

    app.listen(PORT, () => {
        logger.info(`Server started at http://localhost:${PORT}`);
        console.log(`Server started at http://localhost:${PORT}`);

        // Start background jobs
        startBottleneckDetection();
    });
}

createServer();
