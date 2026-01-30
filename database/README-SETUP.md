# Setup Database & Backend

Dự án **đã có sẵn** backend API (Express) và cấu hình database (PostgreSQL). Để chạy được đầy đủ bạn cần làm các bước sau.

## 1. Backend API (đã có trong project)

- **Thư mục:** `server/`
- **API:** Express, routes `/api/v1/`:
  - `GET/POST /api/v1/documents` – hồ sơ
  - `GET/POST /api/v1/auth/login`, `/register`, `/me` – đăng nhập/đăng ký
  - `GET /api/v1/analytics/overview`, `/timeline`, `/by-department` – thống kê
- **Database:** PostgreSQL, cấu hình trong `server/db.ts` (đọc từ biến môi trường).

## 2. Cài PostgreSQL

- Cài PostgreSQL (12+) trên máy: https://www.postgresql.org/download/
- Hoặc dùng Docker:
  ```bash
  docker run -d --name smart-doc-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=smart_doc_tracker -p 5432:5432 postgres:15
  ```

## 3. Tạo database

Nếu chưa tạo database:

```sql
CREATE DATABASE smart_doc_tracker;
```

## 4. Cấu hình .env

Trong thư mục gốc project, tạo/cập nhật file `.env` (có thể copy từ `.env.example`):

```env
# Frontend (Vite)
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Backend - Database (dùng khi chạy npm run dev)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=smart_doc_tracker
DB_PASSWORD=password
DB_PORT=5432

# Tùy chọn: JWT (mặc định có sẵn trong code cho dev)
# JWT_SECRET=your-secret-key
# JWT_EXPIRY=24h
```

Đổi `DB_PASSWORD` (và các biến khác) cho đúng với PostgreSQL của bạn.

## 5. Chạy migrations (tạo bảng)

Chạy lần lượt bằng psql hoặc client SQL (pgAdmin, DBeaver, etc.):

1. **Schema gốc (bảng documents, document_history):**  
   Chạy nội dung file `database/schema.sql`.

2. **Indexes:**  
   Chạy `database/migrations/002_add_indexes.sql`.

3. **Bảng users (auth):**  
   Chạy `database/migrations/003_create_users_table.sql`.

4. **Sửa mật khẩu admin (nếu dùng tài khoản mặc định):**  
   Chạy `database/migrations/004_fix_admin_password.sql`.

Ví dụ bằng psql:

```bash
psql -U postgres -d smart_doc_tracker -f database/schema.sql
psql -U postgres -d smart_doc_tracker -f database/migrations/002_add_indexes.sql
psql -U postgres -d smart_doc_tracker -f database/migrations/003_create_users_table.sql
psql -U postgres -d smart_doc_tracker -f database/migrations/004_fix_admin_password.sql
```

**Lưu ý:** `003_create_users_table.sql` có `DROP TABLE IF EXISTS users` và tạo lại bảng `users`. Nếu bạn đã chạy `schema.sql` trước đó và có bảng `users` cũ, 003 sẽ thay thế bằng bảng users mới (UUID, dùng cho auth hiện tại).

## 6. Chạy ứng dụng

```bash
npm run dev
```

- Backend + frontend chạy cùng lúc (Vite + Express).
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/v1

## 7. Đăng nhập

- **Tài khoản mặc định (sau khi chạy 003 + 004):**  
  Email: `admin@smartdoctracker.com`  
  Mật khẩu: `Admin123!`

- Hoặc dùng **Đăng ký** trên giao diện để tạo tài khoản mới.

---

**Tóm lại:** Dự án đã có database (PostgreSQL) và API backend; bạn chỉ cần cài PostgreSQL, tạo database, cấu hình `.env` và chạy các file SQL theo thứ tự trên là dùng được.
