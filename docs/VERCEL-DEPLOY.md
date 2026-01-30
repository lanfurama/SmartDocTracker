# Deploy Smart Doc Tracker lên Vercel

Project này **có thể chạy trên Vercel** với cấu hình hiện tại. Đã chuẩn bị:

- **Frontend**: Vite build → static trong `dist/`, SPA rewrite về `/index.html`.
- **API**: Express chạy dưới dạng **Vercel Serverless Function** (catch-all `api/[[...slug]].ts`).
- **Cron**: Job bottleneck chạy hàng giờ qua Vercel Cron, gọi `/api/v1/cron/bottleneck`.

## Điều kiện cần có

1. **PostgreSQL**  
   Vercel không host database. Bạn cần dùng Postgres bên ngoài, nên dùng dịch vụ **serverless-friendly** để tránh vượt giới hạn connection:
   - [Neon](https://neon.tech)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)  
   Hoặc Postgres có **connection pooling** (PgBouncer).

2. **Environment variables**  
   Cấu hình trong Vercel: **Project → Settings → Environment Variables**.

   | Biến | Bắt buộc | Ghi chú |
   |------|----------|---------|
   | `DB_USER` | Có | User PostgreSQL |
   | `DB_HOST` | Có | Host DB (vd: `ep-xxx.us-east-1.aws.neon.tech`) |
   | `DB_NAME` | Có | Tên database |
   | `DB_PASSWORD` | Có | Mật khẩu DB |
   | `DB_PORT` | Không | Mặc định `5432` |
   | `JWT_SECRET` | Có | Chuỗi bí mật cho JWT (production) |
   | `JWT_EXPIRY` | Không | Mặc định `24h` |
   | `CRON_SECRET` | Nên có | Bảo vệ endpoint cron (Vercel Cron gửi `Authorization: Bearer <CRON_SECRET>`) |
   | `GEMINI_API_KEY` | Tùy | Cho AI insights trên frontend (build-time) |
   | `VITE_API_BASE_URL` | Không | Mặc định `/api/v1` (cùng domain) |
   | `ALLOWED_ORIGINS` | Không | CORS, mặc định `*` |
   | `LOG_LEVEL` | Không | Mặc định `info` |

   **Lưu ý**: Biến có prefix `VITE_` và `GEMINI_API_KEY` cần khai báo để dùng khi **build** (Vite embed vào frontend).

3. **Database đã sẵn sàng**  
   Chạy migrations (bảng `users`, `documents`, `notifications`, v.v.) trên DB mà bạn dùng cho Vercel. Xem `database/README-SETUP.md`.

## Các bước deploy

1. **Push code lên Git** (GitHub / GitLab / Bitbucket).

2. **Import project trên Vercel**  
   [vercel.com/new](https://vercel.com/new) → Import repo → chọn repo.

3. **Cấu hình build** (thường auto-detect):
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Thêm Environment Variables**  
   Thêm đủ các biến bảng trên (Production + Preview nếu cần).

5. **Deploy**  
   Deploy → Vercel sẽ build Vite và deploy API từ `api/[[...slug]].ts`.

6. **Cron (đã cấu hình trong `vercel.json`)**  
   Mỗi giờ Vercel gọi `GET /api/v1/cron/bottleneck`. Nếu bạn set `CRON_SECRET`, endpoint chỉ chấp nhận request có header `Authorization: Bearer <CRON_SECRET>`.

## Giới hạn cần lưu ý

- **Serverless**: Mỗi request API chạy trong function riêng, không có process chạy nền. Job bottleneck chỉ chạy khi Cron gọi endpoint.
- **Cold start**: Lần gọi đầu có thể chậm ~1–2s. DB nên ở region gần Vercel (vd: `iad1`, `sfo1`).
- **PostgreSQL**: Dùng connection pooling hoặc Postgres serverless (Neon/Supabase) để tránh vượt max connections khi traffic tăng.
- **Hobby plan**: Giới hạn 12 serverless functions/deployment; project này chỉ dùng 1 function (catch-all API) nên không vướng.

## Chạy local sau khi đổi cấu hình

- **Full stack**: `npm run dev` (Vite + Express, API tại `http://localhost:3000/api/v1`).
- **Frontend gọi API**: Mặc định dùng `/api/v1` (relative). Nếu chạy frontend riêng (vd: port khác), set `VITE_API_BASE_URL=http://localhost:3000/api/v1` trong `.env`.

## Tóm tắt file đã thêm/sửa cho Vercel

| File | Mục đích |
|------|----------|
| `server/app.ts` | Express app chỉ API (dùng chung cho dev và Vercel) |
| `server/index.ts` | Dev: dùng `app` + Vite middleware + listen |
| `api/[[...slug]].ts` | Vercel: catch-all `/api/*` → forward vào Express app |
| `server/api/v1/index.ts` | Thêm `GET /cron/bottleneck` cho Vercel Cron |
| `vercel.json` | Build, SPA rewrite, cron schedule |
| `src/infrastructure/api/apiClient.ts` | Default base URL `/api/v1` cho production |
