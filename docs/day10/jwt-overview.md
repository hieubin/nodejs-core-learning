# JWT Overview: Stateless Authentication

Tài liệu này giới thiệu cách bổ sung xác thực stateless bằng JSON Web Token (JWT) cho flow Session-Cookie của Day 8.

## JWT là gì?

JWT (JSON Web Token) là một token dạng chuỗi, thường được server ký để client gửi lại trong các request cần xác thực. Token thường được gửi qua header:

```http
Authorization: Bearer <token>
```

Một JWT có thể chứa các **claims** như `sub` (subject/user id), `role`, `iat` (thời điểm phát hành) và `exp` (thời điểm hết hạn).

### Vì sao gọi là Stateless?

Với Session-Cookie, cookie thường chỉ chứa session id. Server phải tra session id trong session store để biết user là ai:

```text
Cookie: sid=abc123
             |
             v
Server -> session store -> { userId: 42 }
```

Với JWT, request mang theo các claims đã được server ký. Server chỉ cần kiểm tra chữ ký, thời hạn và các claim cần thiết để xác định user; không bắt buộc phải tra một session record cho mỗi request:

```text
Authorization: Bearer <JWT>
                              |
                              v
                       Verify signature -> claims -> userId
```

“Stateless” không có nghĩa là server không lưu bất kỳ dữ liệu nào. Server vẫn có database, key ký, hoặc denylist nếu sản phẩm cần revoke token. Ý chính là authentication state của từng request không phụ thuộc vào một session record bắt buộc phải được đọc từ shared session store.

### JWT hỗ trợ scale thế nào?

- **Session-Cookie:** các instance phía sau load balancer phải cùng dùng một session store, ví dụ Redis hoặc database. Nếu chỉ dùng `MemoryStore` như lab hiện tại, request kế tiếp có thể đi vào instance khác và không tìm thấy session.
- **JWT:** mỗi instance có thể tự verify token bằng cùng secret key hoặc public key. Không cần sticky session và không cần một lần đọc session store cho mỗi request.
- Đổi lại, việc revoke token trước `exp` phức tạp hơn. Nên dùng access token ngắn hạn, refresh token được quản lý riêng, và rotation/revocation khi cần.

JWT không tự động tốt hơn Session-Cookie. Với web app cùng domain, HttpOnly cookie và server-side session vẫn là lựa chọn đơn giản. JWT phù hợp khi nhiều service/client cần xác minh token theo cùng một contract.

## Ba phần của JWT

JWT có ba phần, ngăn bởi dấu chấm (`.`):

```text
header.payload.signature
```

Mỗi phần được mã hóa Base64URL, không phải mã hóa để giữ bí mật.

### 1. Header

Header mô tả metadata của token, thường gồm:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- `alg`: thuật toán ký, ví dụ `HS256`.
- `typ`: loại token, thường là `JWT`.

Server phải cấu hình danh sách thuật toán được phép, không nên tin mù quáng vào giá trị `alg` từ client.

### 2. Payload

Payload chứa claims, ví dụ:

```json
{
  "sub": "42",
  "role": "student",
  "iat": 1700000000,
  "exp": 1700003600
}
```

Payload **không được chứa password, password hash, secret key, API key, hoặc dữ liệu nhạy cảm**. Bất kỳ ai có token đều có thể decode phần này. Chữ ký chỉ giúp phát hiện token bị sửa, không biến payload thành dữ liệu bí mật.

Chỉ đưa vào payload dữ liệu tối thiểu cần cho authorization. Không nên đặt quyền hạn dài hạn vào token nếu quyền đó thường xuyên thay đổi mà application không có cơ chế xử lý token cũ.

### 3. Signature

Với HMAC SHA-256 (`HS256`), chữ ký được tạo từ header và payload đã encode cùng secret key:

```text
HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  secretKey
)
```

Server giữ `secretKey` ở environment hoặc secret manager, không gửi key cho client. Khi nhận token, server tính lại và so sánh signature bằng thư viện JWT đáng tin cậy. Nếu token bị sửa hoặc được ký bằng key khác, verify thất bại.

Với hệ thống nhiều service, có thể dùng thuật toán bất đối xứng như `RS256`: authorization server ký bằng private key, còn các service chỉ cần public key để verify. Private key không được phát tán cho các service verify.

## Thực hành trên JWT.IO

Mở [jwt.io](https://jwt.io/) và dán JWT mẫu sau vào ô **Encoded**:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Quan sát phần **Decoded**:

**Header**:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:

```json
{
  "name": "John Doe",
  "iat": 1516239022
}
```

Thử sửa `name` trong payload. Phần signature không còn khớp, nên token không được server chấp nhận nếu server verify đúng secret và thuật toán.

Kết luận:

- JWT **không che giấu data** khỏi user; Base64URL có thể decode mà không cần secret.
- JWT chủ yếu cung cấp bằng chứng rằng token được ký bởi bên có key và nội dung chưa bị sửa.
- Tính toàn vẹn và tính xác thực không đồng nghĩa với tính bí mật. Nếu cần giấu nội dung, phải dùng cơ chế mã hóa phù hợp, không chỉ dùng JWT ký.
- Không nhập secret production vào JWT.IO. Công cụ này phù hợp để quan sát cấu trúc và thử nghiệm với dữ liệu giả.

## So sánh Session-Cookie và JWT

### Bảng so sánh

| Tiêu chí | Session-Cookie | JWT |
| --- | --- | --- |
| Client lưu | Session id trong cookie | Token chứa claims |
| Server xác thực | Tra session store | Verify signature và claims |
| Shared state giữa instance | Thường bắt buộc | Không bắt buộc cho mỗi request |
| Revoke ngay lập tức | Xóa session | Cần denylist hoặc chờ token hết hạn |
| Kích thước request | Cookie thường nhỏ | Token có thể lớn hơn |
| Rủi ro lộ dữ liệu | Cookie không nên chứa dữ liệu user | Payload đọc được, không chứa secret |
| Phù hợp | Web app cùng domain | API, mobile, nhiều service/client |

### Sơ đồ ASCII

```text
SESSION-COOKIE
Browser -- Cookie: sid --> Load balancer --> App instance
                                      |             |
                                      +--> shared session store
                                           sid -> userId

JWT
Client -- Authorization: Bearer JWT --> Load balancer --> Any app instance
                                                        |
                                                        +--> verify with key
                                                             -> claims/userId
```

### Sơ đồ Mermaid

```mermaid
flowchart LR
    subgraph Session[Session-Cookie]
        B1[Browser] -->|Cookie: sid| LB1[Load balancer]
        LB1 --> A1[App instance]
        A1 -->|lookup sid| Store[(Shared session store)]
        Store -->|userId| A1
    end

    subgraph Token[JWT]
        C1[Client] -->|Authorization: Bearer JWT| LB2[Load balancer]
        LB2 --> A2[Any app instance]
        A2 -->|verify signature and claims| Key[Signing key]
        A2 --> U[Authenticated user]
    end
```

## Liên hệ với code Day 8

Flow Session-Cookie hiện tại tương ứng với:

```javascript
req.session.userId = user.id;
```

và middleware kiểm tra:

```javascript
if (!req.session.userId) {
  // 401 Unauthorized
}
```

Khi chuyển sang JWT, login sẽ tạo token và trả token cho client; middleware sẽ đọc `Authorization`, verify token, rồi gắn user id đã verify vào request, ví dụ `req.auth.userId`. Không nên đồng thời tin `req.body.userId` cho quyết định authorization.
