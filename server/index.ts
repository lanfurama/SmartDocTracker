import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import apiV1Router from './api/v1/index';

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

    // Use vite's connect instance as middleware. If you use your own
    // express router (express.Router()), you should use router.use
    app.use(vite.middlewares);

    // API Routes
    app.use('/api/v1', apiV1Router);

    // Serve HTML
    app.use('*', async (req, res, next) => {
        const url = req.originalUrl;

        try {
            // 1. Read index.html
            let template = await vite.transformIndexHtml(url, '');

            // Note: In development mode with 'custom' appType, we need to manually read the index.html from root
            // However, vite.transformIndexHtml without content argument usually fetches it from root.
            // Alternatively, we can read it manually:
            /*
            import fs from 'fs';
            let template = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            */

            // Simpler approach for pure dev setup: let Vite serve the index.html if no other route matches.
            // But since we set appType: 'custom', we are responsible.
            // Using a simpler trick: Re-read file from disk (or let Vite handle it via transformIndexHtml with manual read)
            const fs = await import('fs');
            const templateContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
            template = await vite.transformIndexHtml(url, templateContent);

            // 2. Apply Vite HTML transforms. This injects the HMR client, and
            //    also applies HTML plugins.

            // 3. Send the HTML back.
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
            // If an error is caught, let Vite fix the stack trace so it maps back
            // to your actual source code.
            vite.ssrFixStacktrace(e as Error);
            next(e);
        }
    });

    app.listen(PORT, () => {
        console.log(`Server started at http://localhost:${PORT}`);
    });
}

createServer();
