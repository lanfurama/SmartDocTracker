import { getPool } from '../db';
import { logger } from '../utils/logger';
import { NotFoundError } from '../middleware/errors';

export interface NotificationRow {
    id: string;
    user_id: string;
    title: string;
    message: string | null;
    type: string;
    read: boolean;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export interface CreateNotificationData {
    userId: string;
    title: string;
    message?: string;
    type?: string;
    metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
    userId: string;
    read?: boolean;
    limit?: number;
    offset?: number;
}

export const notificationRepository = {
    /**
     * Find notifications by user ID (newest first)
     */
    async findByUserId(filters: NotificationFilters): Promise<{ rows: NotificationRow[]; total: number }> {
        const { userId, read, limit = 50, offset = 0 } = filters;
        let whereClause = 'WHERE user_id = $1';
        const params: (string | number | boolean)[] = [userId];
        let paramIndex = 2;

        if (read !== undefined) {
            params.push(read);
            whereClause += ` AND read = $${paramIndex}`;
            paramIndex++;
        }

        const countResult = await getPool().query(
            `SELECT COUNT(*) FROM notifications ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const result = await getPool().query(
            `SELECT id, user_id, title, message, type, read, metadata, created_at
             FROM notifications ${whereClause}
             ORDER BY created_at DESC
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            params
        );

        return { rows: result.rows, total };
    },

    /**
     * Get unread count for user
     */
    async getUnreadCount(userId: string): Promise<number> {
        const result = await getPool().query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
            [userId]
        );
        return parseInt(result.rows[0].count, 10);
    },

    /**
     * Find one by ID (must belong to user)
     */
    async findById(id: string, userId: string): Promise<NotificationRow | null> {
        const result = await getPool().query(
            'SELECT id, user_id, title, message, type, read, metadata, created_at FROM notifications WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return result.rows[0] || null;
    },

    /**
     * Create notification
     */
    async create(data: CreateNotificationData): Promise<NotificationRow> {
        const { userId, title, message, type = 'info', metadata } = data;
        const result = await getPool().query(
            `INSERT INTO notifications (user_id, title, message, type, metadata)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, user_id, title, message, type, read, metadata, created_at`,
            [userId, title, message ?? null, type, metadata ? JSON.stringify(metadata) : null]
        );
        logger.debug('Notification created', { id: result.rows[0].id, userId });
        return result.rows[0];
    },

    /**
     * Mark one as read
     */
    async markAsRead(id: string, userId: string): Promise<NotificationRow | null> {
        const result = await getPool().query(
            `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2
             RETURNING id, user_id, title, message, type, read, metadata, created_at`,
            [id, userId]
        );
        if (result.rows.length === 0) return null;
        return result.rows[0];
    },

    /**
     * Mark all as read for user
     */
    async markAllAsRead(userId: string): Promise<number> {
        const result = await getPool().query(
            'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false RETURNING id',
            [userId]
        );
        return result.rowCount ?? 0;
    }
};
