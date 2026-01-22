import express from 'express';
import { checkConnection } from '../../db';
import documentsRouter from './documents';
import analyticsRouter from './analytics';
import authRouter from './auth';

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

router.use('/auth', authRouter);
router.use('/documents', documentsRouter);
router.use('/analytics', analyticsRouter);

export default router;
