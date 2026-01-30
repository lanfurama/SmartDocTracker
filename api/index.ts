/**
 * Vercel Serverless: single entry for all /api/* (via rewrite).
 * Rewrite sends /api/v1/... → /api?path=v1/...; we restore path so Express routing works.
 */
import app from '../server/app';

export default function handler(req: any, res: any): void {
    const path = req.query?.path;
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    if (typeof pathStr === 'string' && pathStr) {
        req.url = '/api/' + pathStr;
    }
    app(req, res);
}
