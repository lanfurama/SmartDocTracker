import { userRepository, CreateUserData } from '../repositories/userRepository';
import { hashPassword, verifyPassword, generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { ValidationError, NotFoundError, ConflictError } from '../middleware/errors';

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
    role?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt?: string;
    };
    token: string;
}

export interface UserProfile {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        created_at: string;
    };
}

export class AuthService {
    /**
     * Register new user
     * Business rules:
     * - Email must be unique
     * - Password must be hashed
     * - Default role is 'user'
     */
    async registerUser(input: RegisterInput): Promise<AuthResponse> {
        const { email, password, name, role = 'user' } = input;

        // Check if user already exists
        const exists = await userRepository.existsByEmail(email);
        if (exists) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const userData: CreateUserData = {
            email,
            passwordHash,
            name,
            role
        };

        const user = await userRepository.create(userData);

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        logger.info('User registered via service', { userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.created_at
            },
            token
        };
    }

    /**
     * Authenticate user
     * Business rules:
     * - Email must exist
     * - Password must match
     */
    async authenticateUser(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;

        // Get user from database
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new ValidationError('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            logger.warn('Failed login attempt via service', { email });
            throw new ValidationError('Invalid email or password');
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        logger.info('User logged in via service', { userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        };
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(userId: string): Promise<UserProfile> {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return { user };
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(userId: string, email: string, role: string): Promise<string> {
        const token = generateToken({
            userId,
            email,
            role
        });

        logger.info('Token refreshed via service', { userId });

        return token;
    }
}

// Export singleton instance
export const authService = new AuthService();
