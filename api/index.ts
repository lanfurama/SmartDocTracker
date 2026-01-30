/**
 * Vercel Serverless: single entry for all /api/* (via rewrite).
 * Rewrite sends /api/v1/... → /api?path=v1/...; we restore path so Express routing works.
 * Static import so Vercel bundles server/app into the function (dynamic import breaks at runtime).
 */
import app from '../server/app';

export default function handler(req: any, res: any): void {
    try {
        const path = req.query?.path;
        const pathStr = Array.isArray(path) ? path.join('/') : path;
        if (typeof pathStr !== 'string' || !pathStr) {
            res.status(404).json({ error: { message: 'Not found' } });
            return;
        }
        const fullPath = '/api/' + pathStr;
        req.url = fullPath;
        if (typeof req.originalUrl === 'undefined') req.originalUrl = fullPath;
        app(req, res);
    } catch (err: any) {
        if (!res?.headersSent) {
            try {
                res.status(500).json({
                    error: {
                        message: (err as Error)?.message ?? String(err),
                        code: 'FUNCTION_ERROR'
                    }
                });
            } catch (_) {}
        }
    }
}
