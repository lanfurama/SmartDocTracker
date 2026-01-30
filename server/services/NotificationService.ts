import { notificationRepository, NotificationRow, CreateNotificationData } from '../repositories/notificationRepository';
import { logger } from '../utils/logger';
import { NotFoundError } from '../middleware/errors';

export interface NotificationResponse {
    id: string;
    userId: string;
    title: string;
    message: string | null;
    type: string;
    read: boolean;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

export interface NotificationListResult {
    notifications: NotificationResponse[];
    total: number;
    unreadCount: number;
}

function toResponse(row: NotificationRow): NotificationResponse {
    return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        message: row.message,
        type: row.type,
        read: row.read,
        metadata: row.metadata,
        createdAt: row.created_at
    };
}

export class NotificationService {
    /**
     * List notifications for user (requires auth)
     */
    async listForUser(userId: string, options?: { read?: boolean; limit?: number; offset?: number }): Promise<NotificationListResult> {
        const { rows, total } = await notificationRepository.findByUserId({
            userId,
            read: options?.read,
            limit: options?.limit ?? 50,
            offset: options?.offset ?? 0
        });
        const unreadCount = await notificationRepository.getUnreadCount(userId);
        return {
            notifications: rows.map(toResponse),
            total,
            unreadCount
        };
    }

    /**
     * Mark one notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<NotificationResponse> {
        const row = await notificationRepository.markAsRead(notificationId, userId);
        if (!row) {
            throw new NotFoundError('Notification not found');
        }
        logger.debug('Notification marked as read', { notificationId, userId });
        return toResponse(row);
    }

    /**
     * Get unread count for user (lightweight for badge polling)
     */
    async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
        const unreadCount = await notificationRepository.getUnreadCount(userId);
        return { unreadCount };
    }

    /**
     * Mark all as read for user
     */
    async markAllAsRead(userId: string): Promise<{ marked: number }> {
        const marked = await notificationRepository.markAllAsRead(userId);
        logger.debug('All notifications marked as read', { userId, marked });
        return { marked };
    }

    /**
     * Create notification (for system or other modules)
     */
    async create(data: CreateNotificationData): Promise<NotificationResponse> {
        const row = await notificationRepository.create(data);
        return toResponse(row);
    }
}

export const notificationService = new NotificationService();
