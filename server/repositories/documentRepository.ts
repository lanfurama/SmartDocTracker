import { getPool } from '../db';
import { logger } from '../utils/logger';
import { NotFoundError, DatabaseError } from '../middleware/errors';
import type { PoolClient } from 'pg';

export interface DocumentFilters {
    status?: string;
    department?: string;
    category?: string;
    q?: string;
    page?: string | number;
    limit?: string | number;
}

export interface CreateDocumentData {
    id: string;
    qrCode: string;
    title: string;
    description?: string;
    department?: string;
    category?: string;
    currentStatus: string;
    currentHolder: string;
    createdAt?: string;
    history?: Array<{
        action: string;
        location: string;
        user: string;
        type: string;
        notes?: string;
        timestamp: string;
    }>;
}

export interface UpdateStatusData {
    newStatus: string;
    action: string;
    location: string;
    user: string;
    notes?: string;
    type: string;
    updateDate?: string;
}

export const documentRepository = {
    /**
     * Find document by ID with history
     */
    async findById(id: string): Promise<any | null> {
        const docResult = await getPool().query(
            'SELECT * FROM documents WHERE id = $1',
            [id]
        );

        if (docResult.rows.length === 0) {
            return null;
        }

        const historyResult = await getPool().query(
            'SELECT * FROM document_history WHERE document_id = $1 ORDER BY created_at DESC',
            [id]
        );

        return {
            document: docResult.rows[0],
            history: historyResult.rows
        };
    },

    /**
     * Find all documents with filters and pagination
     */
    async findAll(filters: DocumentFilters): Promise<{ rows: any[]; total: number }> {
        const { status, department, category, q, page = 1, limit = 20 } = filters;

        // Build WHERE clause dynamically
        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        if (status) {
            params.push(status);
            whereClause += ` AND current_status = $${params.length}`;
        }

        if (department) {
            params.push(department);
            whereClause += ` AND department_id = $${params.length}`;
        }

        if (category) {
            params.push(category);
            whereClause += ` AND category_id = $${params.length}`;
        }

        if (q) {
            params.push(`%${q}%`);
            whereClause += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }

        // Count total
        const countResult = await getPool().query(
            `SELECT COUNT(*) FROM documents ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated results
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
        const offset = (pageNum - 1) * limitNum;

        params.push(limitNum, offset);
        const docsResult = await getPool().query(
            `SELECT * FROM documents ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        // Get all history for these documents
        const docIds = docsResult.rows.map(d => d.id);
        let historyResult = { rows: [] as any[] };

        if (docIds.length > 0) {
            historyResult = await getPool().query(
                `SELECT * FROM document_history WHERE document_id = ANY($1) ORDER BY created_at DESC`,
                [docIds]
            );
        }

        return {
            rows: docsResult.rows,
            total,
            history: historyResult.rows
        } as any;
    },

    /**
     * Check if QR code already exists
     */
    async existsByQrCode(qrCode: string): Promise<boolean> {
        const result = await getPool().query(
            'SELECT id FROM documents WHERE qr_code = $1',
            [qrCode]
        );
        return result.rows.length > 0;
    },

    /**
     * Create new document with transaction
     */
    async create(data: CreateDocumentData): Promise<string> {
        const pool = getPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { id, qrCode, title, description, department, category, currentStatus, currentHolder, createdAt, history } = data;

            // Insert document
            await client.query(
                `INSERT INTO documents (id, qr_code, title, description, department_id, category_id, current_status, current_holder_name, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
                [id, qrCode, title, description, department, category, currentStatus, currentHolder, createdAt || new Date().toISOString()]
            );

            // Insert history if provided
            if (history && history.length > 0) {
                for (const h of history) {
                    await client.query(
                        `INSERT INTO document_history (document_id, action, location, actor_name, action_type, notes, created_at)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [id, h.action, h.location, h.user, h.type, h.notes, h.timestamp]
                    );
                }
            }

            await client.query('COMMIT');
            logger.info('Document created in repository', { documentId: id, qrCode });
            return id;
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('Failed to create document in repository', { error: err, documentId: data.id });
            throw err;
        } finally {
            client.release();
        }
    },

    /**
     * Update document status with new history entry
     */
    async updateStatus(documentId: string, data: UpdateStatusData): Promise<any> {
        const pool = getPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { newStatus, action, location, user, notes, type, updateDate } = data;

            // Check if document exists
            const docCheck = await client.query('SELECT id FROM documents WHERE id = $1', [documentId]);
            if (docCheck.rows.length === 0) {
                throw new NotFoundError('Document not found');
            }

            // Update document status
            const updateResult = await client.query(
                `UPDATE documents 
                 SET current_status = $1, current_holder_name = $2, updated_at = $3
                 WHERE id = $4
                 RETURNING *`,
                [newStatus, location, updateDate || new Date().toISOString(), documentId]
            );

            // Add history entry
            await client.query(
                `INSERT INTO document_history (document_id, action, location, actor_name, action_type, notes, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [documentId, action, location, user, type, notes, updateDate || new Date().toISOString()]
            );

            // Get updated history
            const historyResult = await client.query(
                'SELECT * FROM document_history WHERE document_id = $1 ORDER BY created_at DESC',
                [documentId]
            );

            await client.query('COMMIT');

            return {
                document: updateResult.rows[0],
                history: historyResult.rows
            };
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('Failed to update document status in repository', { error: err, documentId });
            throw err;
        } finally {
            client.release();
        }
    },

    /**
     * Get history for a document
     */
    async getHistory(documentId: string): Promise<any[]> {
        const result = await getPool().query(
            'SELECT * FROM document_history WHERE document_id = $1 ORDER BY created_at DESC',
            [documentId]
        );
        return result.rows;
    },

    /**
     * Update bottleneck flags for stale documents
     */
    async updateBottleneckFlags(thresholdHours: number): Promise<{ totalUpdated: number; newBottlenecks: number }> {
        const result = await getPool().query(
            `UPDATE documents
             SET is_bottleneck = (
                 EXTRACT(EPOCH FROM (NOW() - updated_at)) / 3600 > $1
             )
             WHERE current_status NOT IN ('COMPLETED', 'RETURNED')
             RETURNING id, title, is_bottleneck`,
            [thresholdHours]
        );

        const bottleneckCount = result.rows.filter(r => r.is_bottleneck).length;

        return {
            totalUpdated: result.rows.length,
            newBottlenecks: bottleneckCount
        };
    }
};
