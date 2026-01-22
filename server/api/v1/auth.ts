import express from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { authService, type RegisterInput, type LoginInput } from '../../services/AuthService';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['admin', 'user', 'viewer']).optional().default('user')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/v1/auth/register - Register new user
 */
router.post('/register', asyncHandler(async (req, res) => {
    const validatedData = registerSchema.parse(req.body) as RegisterInput;
    const result = await authService.registerUser(validatedData);
    res.status(201).json(result);
}));

/**
 * POST /api/v1/auth/login - User login
 */
router.post('/login', asyncHandler(async (req, res) => {
    const validatedData = loginSchema.parse(req.body) as LoginInput;
    const result = await authService.authenticateUser(validatedData);
    res.json(result);
}));

/**
 * GET /api/v1/auth/me - Get current user
 * Requires authentication
 */
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const result = await authService.getCurrentUser(userId);
    res.json(result);
}));

/**
 * POST /api/v1/auth/refresh - Refresh token
 * Requires authentication
 */
router.post('/refresh', authenticate, asyncHandler(async (req: AuthRequest, res) => {
    const user = req.user!;
    const token = await authService.refreshToken(user.userId, user.email, user.role);
    res.json({ token });
}));

export default router;
