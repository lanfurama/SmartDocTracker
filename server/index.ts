import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import app from './app';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { startBottleneckDetection } from './jobs/bottleneckDetector';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const PORT = 3000;

    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
    });

    // Use vite's connect instance as middleware for static assets (before API in dev)
    app.use(vite.middlewares);

    // Handler: serve index.html transformed by Vite (for SPA)
    const serveIndex = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const url = req.originalUrl;
        try {
            const template = await fs.promises.readFile(
                path.resolve(__dirname, '../index.html'),
                'utf-8'
            );
            const html = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            next(e);
        }
    };

    // GET / — root (path-to-regexp v7 '/*splat' does not match '/')
    app.get('/', serveIndex);
    // All other non-API paths — SPA fallback
    app.get('/*splat', serveIndex);

    // Global error handler for SPA/vite (must be last)
    app.use(errorHandler);

    app.listen(PORT, () => {
        logger.info(`Server started at http://localhost:${PORT}`);
        console.log(`Server started at http://localhost:${PORT}`);

        // Start background jobs
        startBottleneckDetection();
    });
}

createServer();
