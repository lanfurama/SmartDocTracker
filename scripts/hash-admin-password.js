/**
 * Generate bcrypt hash for default admin password (Admin123!)
 * Run: node scripts/hash-admin-password.js
 * Use the output in database/migrations/003_create_users_table.sql
 */
import bcrypt from 'bcrypt';

const password = 'Admin123!';
const rounds = 10;

const hash = await bcrypt.hash(password, rounds);
console.log('Password:', password);
console.log('Hash:', hash);
