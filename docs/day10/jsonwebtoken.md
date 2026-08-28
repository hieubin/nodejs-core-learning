# jsonwebtoken: Sign và Verify

Tài liệu này dùng package `jsonwebtoken` để ký và kiểm tra JWT trong lab Day 8.

## Cấu hình

Thêm vào `.env` khi chạy local:

```env
JWT_SECRET=thay_bang_mot_chuoi_ngau_nhien_dai
JWT_EXPIRES_IN=1h
```

`JWT_SECRET` là key server dùng để ký và verify token. Không commit secret thật vào Git; `.env` đã được ignore, còn `.env.example` chỉ chứa placeholder.

## Sign token

Helper trong `experiments/day8/lib/jwt.js`:

```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { sub: user.id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
);
```

Trong code dùng chung:

```javascript
import { signToken } from '../lib/jwt.js';

const token = signToken({ sub: user.id });
res.json({ user, token });
```

Cú pháp tổng quát:

```javascript
jwt.sign(payload, secretOrPrivateKey, options);
```

Payload của lab chỉ nên chứa claim tối thiểu:

```javascript
{ sub: user.id }
```

Có thể dùng `{ userId: user.id }`, nhưng cần thống nhất tên claim giữa lúc sign và verify. Tuyệt đối không đưa các dữ liệu sau vào payload:

- `password`
- `passwordHash`
- `JWT_SECRET` hoặc secret khác
- API key và thông tin nhạy cảm không cần cho authorization

Payload JWT chỉ được Base64URL encode, không được mã hóa. Người có token có thể đọc payload.

## Verify token

Middleware đọc token từ header và kiểm tra bằng secret server:

```javascript
import { verifyToken } from '../lib/jwt.js';

const authorization = req.get('authorization');
const [scheme, token] = authorization?.split(' ') || [];

if (scheme !== 'Bearer' || !token) {
  return next(new HttpError(401, 'Unauthorized'));
}

try {
  req.auth = verifyToken(token);
  next();
} catch {
  next(new HttpError(401, 'Unauthorized'));
}
```

Helper có API tương ứng:

```javascript
import jwt from 'jsonwebtoken';

const claims = jwt.verify(token, process.env.JWT_SECRET);
```

Cú pháp tổng quát:

```javascript
jwt.verify(token, secretOrPublicKey, options);
```

`verify` kiểm tra chữ ký và các claim thời gian như `exp`. Nếu token bị sửa, hết hạn, sai secret, hoặc không đúng format, hàm sẽ throw error. Application nên trả `401 Unauthorized` và không gửi chi tiết lỗi JWT cho client.

`verifyToken` trong lab fail fast ngay khi module được import nếu thiếu `JWT_SECRET`. Không dùng fallback secret hardcode: fallback có thể khiến nhiều môi trường vô tình dùng chung một key đã biết.

## `expiresIn` và bảo mật

`expiresIn` đặt thời gian sống của token. Ví dụ:

```javascript
jwt.sign({ sub: user.id }, secret, { expiresIn: '1h' });
```

Thư viện đưa `exp` vào payload. Sau thời điểm đó, `jwt.verify` từ chối token. Thời hạn không ngăn token bị đánh cắp trong lúc còn hiệu lực, nhưng giới hạn khoảng thời gian kẻ xấu có thể sử dụng token.

Không nên để token sống vài năm hoặc vô hạn vì:

- Token bị lộ sẽ tiếp tục dùng được trong thời gian rất dài.
- JWT stateless không thể tự biến mất khỏi mọi client chỉ bằng cách xóa một session record.
- Thay đổi role hoặc khóa tài khoản không nhất thiết vô hiệu hóa token cũ ngay lập tức.
- Vòng đời dài làm tăng tác động của lỗi lưu trữ token và log bị lộ.

Thực tế thường dùng access token ngắn hạn, ví dụ vài phút đến khoảng một giờ. Nếu cần đăng nhập lâu, dùng refresh token với cơ chế rotation, revoke và lưu trữ an toàn; không kéo dài access token vô hạn.

## Liên hệ với Session-Cookie Day 8

Flow hiện tại lưu trạng thái server-side:

```javascript
req.session.userId = user.id;
```

Flow JWT sẽ tạo token sau khi login thành công:

```javascript
const token = signToken({ sub: user.id });
res.json({ user, token });
```

Các request sau gửi:

```http
Authorization: Bearer <token>
```

Middleware verify token rồi dùng `req.auth.sub` cho authorization. Không lấy `userId` từ request body để quyết định user nào đang đăng nhập.

JWT giúp các instance verify độc lập mà không bắt buộc shared session store, nhưng đổi lại việc revoke sớm phức tạp hơn. Vì vậy thời hạn hợp lý và chiến lược refresh/revoke là một phần của thiết kế bảo mật, không phải chi tiết tùy chọn.
