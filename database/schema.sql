-- Database Schema for SmartDocTracker
-- Compatible with PostgreSQL/SQLite

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department_id VARCHAR(10) REFERENCES departments(id),
    role VARCHAR(20) DEFAULT 'USER', -- 'ADMIN', 'USER', 'MANAGER'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) PRIMARY KEY, -- e.g. KTO-HDLD-1025-001
    qr_code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id VARCHAR(10) REFERENCES departments(id),
    category_id VARCHAR(10) REFERENCES categories(id),
    current_status VARCHAR(50) NOT NULL, -- e.g. 'SENDING', 'PROCESSING'
    current_holder_name VARCHAR(100), -- Display name of current holder
    current_holder_user_id INT REFERENCES users(id), -- Optional link to system user
    is_bottleneck BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Document History (Log Entries)
CREATE TABLE IF NOT EXISTS document_history (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(50) REFERENCES documents(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- e.g. 'Khởi tạo hồ sơ', 'Chuyển đi'
    location VARCHAR(150),
    actor_name VARCHAR(100), -- Name of person who performed action
    actor_user_id INT REFERENCES users(id),
    notes TEXT,
    action_type VARCHAR(20) CHECK (action_type IN ('in', 'out', 'info', 'error')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data Seeding (Optional - based on Constants)

-- Seed Departments
INSERT INTO departments (id, name) VALUES
('KTO', 'Kế toán'),
('HCH', 'Hành chính'),
('NNS', 'Nhân sự'),
('KDZ', 'Kinh doanh'),
('TKT', 'Thiết kế');

-- Seed Categories
INSERT INTO categories (id, name) VALUES
('HDLD', 'Hợp đồng lao động'),
('HDDV', 'Hợp đồng dịch vụ'),
('QTTX', 'Quyết toán thuế'),
('TTRH', 'Tạm ứng/Hoàn ứng'),
('YCMU', 'Yêu cầu mua sắm');

-- Seed Sample User
INSERT INTO users (username, password_hash, full_name, department_id, role) VALUES
('admin', 'hashed_placeholder', 'Administrator', 'HCH', 'ADMIN'),
('hr_user', 'hashed_placeholder', 'Nguyen Thu Huong', 'NNS', 'USER');
