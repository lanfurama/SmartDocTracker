import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'smart_doc_tracker',
    password: process.env.DB_PASSWORD || 'password',
    port: Number(process.env.DB_PORT) || 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getPool = () => pool;
export const checkConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        return { status: 'connected', time: res.rows[0].now };
    } catch (err: any) {
        return { status: 'error', message: err.message };
    }
};
