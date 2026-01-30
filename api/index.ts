/**
 * Vercel Serverless: single entry for all /api/* (via rewrite).
 * Rewrite sends /api/v1/... → /api?path=v1/...; we restore path so Express routing works.
 */
import app from '../server/app';

export default function handler(req: any, res: any): void {
    try {
        const path = req.query?.path;
        const pathStr = Array.isArray(path) ? path.join('/') : path;
        if (typeof pathStr === 'string' && pathStr) {
            const fullPath = '/api/' + pathStr;
            req.url = fullPath;
            if (typeof req.originalUrl === 'undefined') req.originalUrl = fullPath;
        }
        app(req, res);
    } catch (err: any) {
        if (!res.headersSent) {
            res.status(500).json({
                error: {
                    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err?.message || String(err)),
                    code: 'FUNCTION_ERROR'
                }
            });
        }
    }
}
