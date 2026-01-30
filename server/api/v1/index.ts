import express from 'express';
import { checkConnection } from '../../db';
import documentsRouter from './documents';
import analyticsRouter from './analytics';
import authRouter from './auth';
import notificationsRouter from './notifications';
import { updateBottlenecks } from '../../jobs/bottleneckDetector';

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/check-db', async (req, res) => {
    const result = await checkConnection();
    if (result.status === 'connected') {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

/** Vercel Cron: run bottleneck detection. Protected by CRON_SECRET. */
router.get('/cron/bottleneck', async (req, res) => {
    const secret = process.env.CRON_SECRET;
    const auth = req.headers.authorization;
    if (secret && auth !== `Bearer ${secret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        await updateBottlenecks();
        res.json({ ok: true, ran: 'bottleneck' });
    } catch (e) {
        res.status(500).json({ error: String((e as Error).message) });
    }
});

router.use('/auth', authRouter);
router.use('/documents', documentsRouter);
router.use('/analytics', analyticsRouter);
router.use('/notifications', notificationsRouter);

export default router;
