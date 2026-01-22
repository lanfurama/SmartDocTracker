import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from './errors';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const BCRYPT_ROUNDS = 10;

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        throw new AuthenticationError('Invalid or expired token');
    }
};

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AuthenticationError('No authorization header provided');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new AuthenticationError('Invalid authorization header format. Expected: Bearer <token>');
        }

        const token = parts[1];
        const payload = verifyToken(token);

        req.user = payload;
        logger.debug('User authenticated', { userId: payload.userId, role: payload.role });
        next();
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw error;
        }
        throw new AuthenticationError('Authentication failed');
    }
};

/**
 * Authorization middleware factory - checks user role
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AuthenticationError('User not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('Authorization failed', {
                userId: req.user.userId,
                role: req.user.role,
                allowedRoles
            });
            throw new AuthorizationError('Insufficient permissions');
        }

        next();
    };
};

/**
 * Optional authentication - adds user to request if token is valid, but doesn't require it
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const payload = verifyToken(token);
                req.user = payload;
            }
        }
    } catch (error) {
        // Silently ignore authentication errors for optional auth
        logger.debug('Optional auth failed', { error });
    }

    next();
};
