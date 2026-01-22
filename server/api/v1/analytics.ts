import express from 'express';
import { query } from '../../db';

const router = express.Router();

router.get('/overview', async (req, res) => {
    try {
        // Parallelize count queries for performance
        const [totalRes, completedRes, processingRes, bottleneckRes] = await Promise.all([
            query('SELECT COUNT(*) FROM documents'),
            query("SELECT COUNT(*) FROM documents WHERE current_status = 'COMPLETED'"),
            query("SELECT COUNT(*) FROM documents WHERE current_status = 'PROCESSING'"), // Or in transit, etc.
            query('SELECT COUNT(*) FROM documents WHERE is_bottleneck = true')
        ]);

        res.json({
            totalDocs: parseInt(totalRes.rows[0].count),
            completed: parseInt(completedRes.rows[0].count),
            processing: parseInt(processingRes.rows[0].count),
            bottlenecks: parseInt(bottleneckRes.rows[0].count),
            // Mocking 'inTransit' as total - completed for now, or specific statuses
            inTransit: parseInt(totalRes.rows[0].count) - parseInt(completedRes.rows[0].count)
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
