# JWT Auth Flow: Option A

## Lựa chọn triển khai

Lab chọn **Option A: JWT song song với Session-Cookie**.

- Register vẫn dùng bcrypt để hash password và lưu `passwordHash`.
- Login vẫn compare password bằng bcrypt.
- Sau khi login thành công, server tạo JWT và trả `{ token, user }`.
- Login vẫn gán `req.session.userId` để giữ flow Session-Cookie phục vụ so sánh.
- `/auth/me` dùng `authMiddleware` và JWT là cơ chế xác thực chính.
- `requireAuth` session vẫn tồn tại, nhưng không được dùng cho `/auth/me` trong flow JWT này.

### Route matrix

| Route | Quyền truy cập | Middleware | Ghi chú |
| --- | --- | --- | --- |
| `POST /auth/register` | Public | Không | Register dùng bcrypt và trả safe user |
| `POST /auth/login` | Public | Không | Bcrypt login, trả `{ token, user }` và giữ session để so sánh |
| `GET /auth/me` | Private | `authMiddleware` | Cần `Authorization: Bearer <token>` |
| `/posts` | Private | `authMiddleware` | GET/POST/PUT/DELETE đều cần JWT |
| `/users` | Public trong lab hiện tại | Không | Response user vẫn phải omit `passwordHash` |

`GET /` là public health/root endpoint. Các route private không có token hoặc có token sai đều trả `401 Unauthorized`.

## Client lưu JWT ở đâu?

Trong lab Postman, lưu token vào một environment variable, ví dụ `jwt_token`, sau response login:

```text
jwt_token = {{response.token}}
```

Các lựa chọn phổ biến ở browser:

- **Memory:** giảm thời gian token tồn tại sau reload và tránh nhiều rủi ro XSS từ storage, nhưng user phải đăng nhập lại khi reload.
- **localStorage:** dễ dùng và tồn tại sau reload, nhưng JavaScript bị XSS có thể đọc token. Không lưu token dài hạn ở đây nếu chưa có biện pháp bảo vệ XSS phù hợp.
- **HttpOnly cookie:** JavaScript không đọc được cookie, nhưng cần thiết kế CSRF protection và cookie policy đúng.

Không đưa JWT vào URL, log, hoặc nơi có thể bị chia sẻ ngoài ý muốn.

## Login API

`POST /auth/login` vẫn nhận email/password và giữ nguyên bcrypt flow:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "correct horse battery staple"
}
```

Sau `bcrypt.compare` thành công, service ký payload tối thiểu:

```javascript
const token = signToken({ userId: user.id });
```

Response chỉ chứa safe user:

```json
{
  "token": "<signed-jwt>",
  "user": {
    "id": 42,
    "name": "Alice",
    "email": "alice@example.com"
  }
}
```

Không đưa `password` hoặc `passwordHash` vào JWT hay response user.

## Gửi token ở request sau

Client gửi token trong header `Authorization` với scheme `Bearer`:

```http
GET /auth/me
Authorization: Bearer <token>
```

## GET `/auth/me`

Route dùng JWT middleware:

```javascript
router.get('/me', authMiddleware, authCtrl.me);
```

Controller đọc id đã được verify, không lấy id từ request body:

```javascript
const user = await authService.findCurrentUser(req.user.id);
res.json(user);
```

`findCurrentUser` chỉ trả `id`, `name`, `email`; `passwordHash` không được trả ra client.

## `authMiddleware` bắt buộc làm gì?

1. Đọc `req.headers.authorization`.
2. Tách đúng format `Bearer <token>`.
3. Thiếu header, sai scheme, thiếu token hoặc có phần thừa: trả `401 Unauthorized`.
4. Gọi `verifyToken(token)`.
5. Token hết hạn hoặc signature sai: trả `401 Unauthorized` qua `HttpError`.
6. Token hợp lệ: gắn `req.user = { id: claims.userId }` rồi gọi `next()`.

```mermaid
flowchart TD
    A[Request GET /auth/me] --> B[Read Authorization header]
    B --> C{Bearer token đúng format?}
    C -->|No| D[HttpError 401 Unauthorized]
    C -->|Yes| E[verifyToken]
    E --> F{Expired or invalid signature?}
    F -->|Yes| D
    F -->|No| G[req.user = { id: claims.userId }]
    G --> H[auth.controller.me]
    H --> I[findCurrentUser]
    I --> J[200 safe user]
```

## So sánh hai cơ chế trong lab

```text
Session-Cookie (giữ lại để so sánh)
POST /auth/login -> req.session.userId = user.id
GET  /auth/me    -> requireAuth -> session store -> userId

JWT (flow chính của Day 10)
POST /auth/login -> signToken({ userId: user.id }) -> { token, user }
GET  /auth/me    -> authMiddleware -> verifyToken -> req.user.id
```

JWT giúp instance tự verify mà không bắt buộc shared session store cho mỗi request. Đổi lại, token còn hạn không dễ revoke tức thời như session; vì vậy `JWT_EXPIRES_IN` nên ngắn và không được dùng token vài năm hoặc vô hạn.

## Quy tắc bảo mật

- Không để password hoặc `passwordHash` trong payload JWT.
- Không hardcode hoặc commit `JWT_SECRET` thật.
- Dùng `HttpError` hiện có để trả lỗi xác thực thống nhất.
- Không để lỗi verify chi tiết lộ ra client.
- Không phá register: bcrypt và `passwordHash` vẫn được giữ nguyên.