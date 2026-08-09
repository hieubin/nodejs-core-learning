# Prisma Client CRUD

## Mapping hành động tới Prisma

- Create: `prisma.model.create({ data })`
- Read Many: `prisma.model.findMany()`
- Read One: `prisma.model.findUnique({ where: { id } })`
- Update: `prisma.model.update({ where: { id }, data })`
- Delete: `prisma.model.delete({ where: { id } })`

## Eager loading với `include`

- `include` cho phép lấy quan hệ liên quan trong cùng 1 query.
- Ví dụ với User và Post:
  - `prisma.user.findUnique({ where: { id }, include: { posts: true } })`

## Route mapping trong experiment/day8

- `POST /users` → `prisma.user.create`
- `GET /users` → `prisma.user.findMany`
- `GET /users/:id` → `prisma.user.findUnique` + `include: { posts: true }`
- `PUT /users/:id` → `prisma.user.update`
- `DELETE /users/:id` → `prisma.user.delete`

- `POST /posts` → `prisma.post.create`
- `GET /posts` → `prisma.post.findMany({ include: { author: true } })`
- `GET /posts/:id` → `prisma.post.findUnique({ where: { id }, include: { author: true } })`
- `PUT /posts/:id` → `prisma.post.update`
- `DELETE /posts/:id` → `prisma.post.delete`

## Chú ý

- Không dùng raw SQL trong routes.
- Không dùng `pg.Pool` với Prisma.
- Prisma Client đã được tách riêng trong `experiments/day8/lib/prisma.js` để reuse một instance.
- App mount router giống cấu trúc Day 4.
