import express from 'express';
import { query } from '../../db';

const router = express.Router();

// Helper to format document from DB row
const formatDoc = (row: any, historyRows: any[] = []) => ({
    id: row.id,
    qrCode: row.qr_code,
    title: row.title,
    description: row.description,
    department: row.department_id,
    category: row.category_id,
    currentStatus: row.current_status,
    currentHolder: row.current_holder_name,
    lastUpdate: row.updated_at,
    createdAt: row.created_at,
    isBottleneck: row.is_bottleneck,
    history: historyRows
        .filter(h => h.document_id === row.id)
        .map(h => ({
            id: h.id.toString(),
            timestamp: h.created_at,
            action: h.action,
            location: h.location,
            user: h.actor_name,
            type: h.action_type,
            notes: h.notes
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
});

// GET / - Get all documents
router.get('/', async (req, res) => {
    try {
        const docsResult = await query('SELECT * FROM documents ORDER BY created_at DESC');
        const historyResult = await query('SELECT * FROM document_history ORDER BY created_at DESC');

        const docs = docsResult.rows.map(doc => formatDoc(doc, historyResult.rows));
        res.json(docs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /:id - Get single document
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docResult = await query('SELECT * FROM documents WHERE id = $1', [id]);

        if (docResult.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const historyResult = await query('SELECT * FROM document_history WHERE document_id = $1 ORDER BY created_at DESC', [id]);
        res.json(formatDoc(docResult.rows[0], historyResult.rows));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /qr/:code - Get by QR code
router.get('/qr/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const docResult = await query('SELECT * FROM documents WHERE qr_code = $1', [code]);

        if (docResult.rows.length === 0) {
            // Return 404 is standard, but frontend might expect null. Let's return 404 for API correctness.
            return res.status(404).json({ error: 'Document not found' });
        }

        const docId = docResult.rows[0].id;
        const historyResult = await query('SELECT * FROM document_history WHERE document_id = $1 ORDER BY created_at DESC', [docId]);
        res.json(formatDoc(docResult.rows[0], historyResult.rows));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST / - Create new document
router.post('/', async (req, res) => {
    try {
        const { id, qrCode, title, description, department, category, currentStatus, currentHolder, createdAt, history } = req.body;

        // 1. Insert Document
        await query(
            `INSERT INTO documents (id, qr_code, title, description, department_id, category_id, current_status, current_holder_name, created_at, updated_at, is_bottleneck)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, false)
       RETURNING *`,
            [id, qrCode, title, description, department, category, currentStatus, currentHolder, createdAt || new Date().toISOString()]
        );

        // 2. Insert Initial History
        if (history && history.length > 0) {
            const h = history[0];
            await query(
                `INSERT INTO document_history (document_id, action, location, actor_name, action_type, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, h.action, h.location, h.user, h.type, h.notes, h.timestamp]
            );
        }

        // Return the newly created doc structure
        // We could fetch it back, but let's just return what we constructed to save a roundtrip if valid
        res.status(201).json({ status: 'created', id });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /:id/actions - Update status and add history
router.post('/:id/actions', async (req, res) => {
    const client = await import('../../db').then(m => m.query); // Use generic query for now, transactions would be better but keeping it simple as per earlier pattern
    // Actually, to do transaction we need access to pool client. 
    // For this scope, let's run sequential queries. If one fails, data might be inconsistent but acceptable for MVP/Mock phase request.

    try {
        const { id } = req.params;
        const { newStatus, action, location, user, notes, type, updateDate } = req.body;
        // Expected body matches what frontend service would send for history + status update

        // 1. Update Document Status
        const updateResult = await query(
            `UPDATE documents 
       SET current_status = $1, updated_at = $2, current_holder_name = $3
       WHERE id = $4
       RETURNING *`,
            [newStatus, updateDate || new Date().toISOString(), user, id] // Assuming 'user' becomes the new holder/handler? Or location?
            // Logic check: if transferring, holder might change. 'user' in history is the actor.
            // For MVP, user (actor) is often the one holding it now or passing it.
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // 2. Insert History
        await query(
            `INSERT INTO document_history (document_id, action, location, actor_name, action_type, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, action, location, user, type, notes, updateDate || new Date().toISOString()]
        );

        // 3. Return updated full document
        const historyResult = await query('SELECT * FROM document_history WHERE document_id = $1 ORDER BY created_at DESC', [id]);
        res.json(formatDoc(updateResult.rows[0], historyResult.rows));

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
