/**
 * Vercel Serverless: catch-all for /api/* — forwards to Express app.
 * Request path is preserved (e.g. /api/v1/health) so Express routing works.
 */
import app from '../server/app';

export default app;
