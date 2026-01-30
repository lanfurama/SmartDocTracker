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
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters')
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
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

/**
 * PATCH /api/v1/auth/profile - Update profile (name)
 * Requires authentication
 */
router.patch('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const validated = updateProfileSchema.parse(req.body);
    const result = await authService.updateProfile(userId, validated);
    res.json(result);
}));

/**
 * PATCH /api/v1/auth/password - Change password
 * Requires authentication
 */
router.patch('/password', authenticate, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const validated = changePasswordSchema.parse(req.body);
    await authService.changePassword(userId, validated.currentPassword, validated.newPassword);
    res.json({ success: true });
}));

export default router;
