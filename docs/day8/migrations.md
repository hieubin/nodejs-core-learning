# Prisma Migrations

## `npx prisma migrate dev --name <migration_name>`

### Làm gì với PostgreSQL?
- So sánh schema hiện tại trong `prisma/schema.prisma` với database.
- Sinh ra file migration SQL chứa các thay đổi cần thiết.
- Áp dụng migration đó lên PostgreSQL.
- Cập nhật metadata migration để ghi nhận trạng thái database đã sync.

### Sinh ra thư mục/file nào?
- Tạo một thư mục mới trong `prisma/migrations/` có tên bắt đầu bằng timestamp và suffix là tên migration.
- Ví dụ:
  - `prisma/migrations/20260809154333_init_relations/`
  - `prisma/migrations/20260809154518_add_user_phone/`
- Trong thư mục đó có một file `migration.sql` chứa các lệnh SQL để thay đổi database.
- Prisma cũng sinh `prisma/migrations/migration_lock.toml` để quản lý trạng thái migration.

## `migrate dev` vs `migrate deploy`

| Lệnh | Mục đích | Khi dùng | Khác nhau cốt lõi |
|---|---|---|---|
| `npx prisma migrate dev` | Phát triển local | Dev, thử nghiệm schema | Tạo và áp dụng migration; có thể reset schema local |
| `npx prisma migrate deploy` | Triển khai production | Prod / staging | Chỉ áp dụng migration đã tồn tại; không tạo mới migration |

### Vì sao dùng `migrate deploy` ở production?
- Production chỉ nên chạy migration đã được tạo và kiểm tra trước.
- `deploy` không sinh migration mới từ schema; nó chỉ áp dụng các migration SQL hiện có.
- Điều này tránh việc thay đổi schema tự động không kiểm soát trên môi trường production.

## Quy trình thêm cột chuẩn

1. Sửa `prisma/schema.prisma`.
   - Ví dụ: thêm `phone String?` vào model `User`.
2. Chạy:
   - `npx prisma migrate dev --name add_user_phone`
3. Prisma sẽ tạo migration mới và áp dụng vào database.
4. Commit cả:
   - `prisma/schema.prisma`
   - thư mục migration mới trong `prisma/migrations/`

### Tuyệt đối không làm
- Không dùng DBeaver/pgAdmin để ALTER TABLE tay rồi quên sync schema.
- Không xem GUI database là source of truth.
- Source of truth là `prisma/schema.prisma` và các file migration trong repo.

## Kết luận

- `Prisma migrate dev` dùng khi thay đổi schema trong quá trình phát triển.
- `Prisma migrate deploy` dùng khi áp dụng migration đã có lên production.
- Luồng chuẩn: sửa schema → `migrate dev` → commit schema + migration.
