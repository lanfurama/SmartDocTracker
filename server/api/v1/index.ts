import checkConnection from '../../db';

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

export default router;
