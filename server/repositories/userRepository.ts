import { getPool } from '../db';
import { logger } from '../utils/logger';

export interface CreateUserData {
    email: string;
    passwordHash: string;
    name: string;
    role: string;
}

export const userRepository = {
    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<any | null> {
        const result = await getPool().query(
            'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    },

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<any | null> {
        const result = await getPool().query(
            'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    },

    /**
     * Check if email already exists
     */
    async existsByEmail(email: string): Promise<boolean> {
        const result = await getPool().query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        return result.rows.length > 0;
    },

    /**
     * Create new user
     */
    async create(userData: CreateUserData): Promise<any> {
        const pool = getPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { email, passwordHash, name, role } = userData;

            const result = await client.query(
                `INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW())
                 RETURNING id, email, name, role, created_at`,
                [email, passwordHash, name, role]
            );

            await client.query('COMMIT');

            logger.info('User created in repository', { userId: result.rows[0].id, email });
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('Failed to create user in repository', { error: err, email: userData.email });
            throw err;
        } finally {
            client.release();
        }
    }
};
