/**
 * Vercel Serverless: single entry for all /api/* (via rewrite).
 * Rewrite sends /api/v1/... → /api?path=v1/...; we restore path so Express routing works.
 * Dynamic import to catch load errors; return error details so we can debug FUNCTION_INVOCATION_FAILED.
 */
function sendError(res: any, err: any): void {
    if (!res || res.headersSent) return;
    const msg = err?.message ?? String(err);
    const stack = err?.stack;
    try {
        res.status(500).json({
            error: {
                message: msg,
                code: 'FUNCTION_ERROR',
                ...(stack && { stack })
            }
        });
    } catch (_) {}
}

export default async function handler(req: any, res: any): Promise<void> {
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

        // Health check without loading Express/DB — confirms handler runs on Vercel
        if (req.method === 'GET' && pathStr === 'v1/health') {
            res.status(200).json({ status: 'ok', source: 'api-handler' });
            return;
        }

        const { default: app } = await import('../server/app');
        app(req, res);
    } catch (err: any) {
        sendError(res, err);
    }
}
