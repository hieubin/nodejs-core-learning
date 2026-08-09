# ORM Overview

## ORM là gì?

ORM (Object-Relational Mapping) là kỹ thuật ánh xạ giữa bảng trong cơ sở dữ liệu quan hệ và các đối tượng/class trong ứng dụng.

Thay vì viết SQL trực tiếp, ORM cho phép:
- thao tác dữ liệu bằng object và phương thức,
- tạo, đọc, sửa, xóa thông qua model class,
- ánh xạ cột thành thuộc tính object.

## Vì sao map bảng → Object/Class?

- Giữ code gần với cách lập trình hướng đối tượng.
- Giảm số lượng SQL thủ công.
- Tái sử dụng logic validation, computed property, relation mapping.
- Tạo ra API dữ liệu đồng nhất cho ứng dụng.

## So sánh Raw SQL vs ORM

| Điểm | Raw SQL (`pg`) | ORM (Prisma / TypeORM) |
|---|---|---|
| Viết truy vấn | Viết SQL bằng tay | Dùng API của model / query builder |
| Độ rõ ràng | Rõ ràng với người biết SQL | Dễ đọc hơn với lập trình viên JS/TS |
| An toàn | Dễ lỗi SQL injection nếu không cẩn thận | ORM thường tự escape tham số |
| Tương thích schema | Cần tự quản lý schema | ORM có schema/migration hỗ trợ |
| Bảo trì | Thay đổi schema phải sửa SQL thủ công | Thay đổi model có thể được migrate tự động |
| Hiệu năng | Có thể tối ưu kỹ bằng tay | Có thể bị trừ nếu dùng không đúng |
| Kiểm soát | Toàn quyền với SQL | Hạn chế hơn nhưng nhanh hơn dev |
| Learning curve | Phải biết SQL | Học cách dùng ORM và ánh xạ object |

## Prisma sơ lược

- `schema.prisma` là nơi khai báo model và mối quan hệ giữa các bảng.
- Prisma dùng schema để sinh client và quản lý migrations.
- Từ `schema.prisma`, Prisma có thể tạo các truy vấn và map dữ liệu vào object.

## Migration là gì?

Migration là tập các thay đổi schema có thể áp dụng để cập nhật cơ sở dữ liệu.

Tại sao không tạo/sửa bảng tay trên DBeaver/pgAdmin trong dự án thật?
- Khó theo dõi lịch sử thay đổi schema.
- Khó đồng bộ giữa môi trường dev/test/prod.
- Có thể gây sai lệch schema giữa máy khác nhau.
- Migrations đảm bảo thay đổi schema có thể tái lập và kiểm soát từ code.

Trong dự án thật, ta nên dùng migration để:
- định nghĩa schema trong code,
- version control thay đổi schema,
- chạy trên nhiều môi trường giống nhau.
