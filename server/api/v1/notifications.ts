import express from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { validate } from '../../middleware/validation';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { notificationService } from '../../services/NotificationService';
import { z } from 'zod';

const router = express.Router();

const createNotificationSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    message: z.string().optional(),
    type: z.enum(['info', 'alert', 'document', 'system']).optional().default('info'),
    metadata: z.record(z.unknown()).optional()
});

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/notifications - List notifications for current user
 * Query: read (boolean), limit (number), offset (number)
 */
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const read = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
    const result = await notificationService.listForUser(userId, { read, limit, offset });
    res.json(result);
}));

/**
 * GET /api/v1/notifications/unread-count - Lightweight unread count for badge polling
 */
router.get('/unread-count', asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const result = await notificationService.getUnreadCount(userId);
    res.json(result);
}));

/**
 * POST /api/v1/notifications - Create notification for current user (or for system use)
 * Body: { title, message?, type?, metadata? }
 */
router.post('/', validate(createNotificationSchema), asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const { title, message, type, metadata } = req.body;
    const result = await notificationService.create({ userId, title, message, type, metadata });
    res.status(201).json(result);
}));

/**
 * PATCH /api/v1/notifications/read-all - Mark all as read
 */
router.patch('/read-all', asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const result = await notificationService.markAllAsRead(userId);
    res.json(result);
}));

/**
 * PATCH /api/v1/notifications/:id/read - Mark one as read
 */
router.patch('/:id/read', asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await notificationService.markAsRead(id, userId);
    res.json(result);
}));

export default router;
