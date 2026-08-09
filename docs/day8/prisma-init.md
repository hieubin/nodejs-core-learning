# Prisma Init

Sau chạy `npx prisma init`, những file/folder chính thường xuất hiện:

- `prisma/schema.prisma`
  - Đây là file khai báo datasource, generator và model.
  - `datasource` chỉ định database provider và `DATABASE_URL`.
  - `generator` định nghĩa client sẽ sinh ra Prisma Client.
  - `model` mô tả cấu trúc bảng và quan hệ giữa các bảng.

- `.env`
  - Chứa `DATABASE_URL` để kết nối đến PostgreSQL.
  - Trong dự án thật, `.env` thường bị ignore và chỉ lưu giá trị nội bộ.

- `prisma/migrations/`
  - Chứa các migration đã tạo khi dùng Prisma Migrate.
  - Migration giúp version-control schema và áp dụng thay đổi database nhất quán.

- `node_modules/` (sẽ chứa `@prisma/client` sau khi cài)

## Vai trò chính

- `prisma/schema.prisma` là nguồn sự thật cho data model.
- `.env` cung cấp thông tin kết nối database.
- `prisma/migrations/` lưu lịch sử thay đổi schema, không nên sửa thủ công.

## Lưu ý

- `DATABASE_URL` nên trỏ đến PostgreSQL lab hoặc database local.
- Không commit password thật vào `.env`.
- Dùng `.env.example` hoặc cấu hình môi trường khác cho team.
