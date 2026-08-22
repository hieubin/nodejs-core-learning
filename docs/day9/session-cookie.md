# Session và Cookie

## HTTP stateless là gì?

HTTP là **stateless**: mỗi request độc lập với request trước đó. Sau khi xử lý một request, server không tự động nhớ request đó đến từ user nào. Vì vậy, request sau cần mang theo một dấu hiệu để server nhận diện user.

Cơ chế phổ biến là **session authentication**:

- Server tạo một session sau khi xác thực thành công.
- Server lưu thông tin session ở server-side session store.
- Browser giữ session ID trong cookie và tự gửi cookie ở các request tiếp theo.
- Server đọc session ID, tra session store và biết request thuộc về user nào.

Session ID nên là một chuỗi ngẫu nhiên, khó đoán và không chứa trực tiếp thông tin nhạy cảm. Không nên dùng email hoặc `userId` làm session ID.

## Workflow Session auth

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as Server
    participant SS as Session store

    B->>S: POST /login (email, password)
    S->>S: Verify password
    S->>SS: Create session (sessionId -> userId, expiry)
    S-->>B: Set-Cookie: sessionId=...; HttpOnly; Secure; SameSite=Lax
    B->>S: Request tiếp theo + Cookie: sessionId=...
    S->>SS: Lookup sessionId
    SS-->>S: userId và session data
    S-->>B: Response theo quyền của user
```

Diễn biến cụ thể:

1. User gửi email và password trong request đăng nhập.
2. Server tìm user, verify password hash và xác thực thành công.
3. Server tạo một session ID ngẫu nhiên, rồi lưu bản ghi vào **session store server-side**, ví dụ Redis hoặc database:

   ```text
   sessionId -> { userId: 42, expiresAt: ... }
   ```

4. Server gửi session ID về browser trong header `Set-Cookie`.
5. Browser lưu cookie theo các thuộc tính của cookie.
6. Ở request sau đến đúng phạm vi cookie, browser tự đính kèm:

   ```http
   Cookie: sessionId=<random-session-id>
   ```

7. Server lấy session ID, tra session store, lấy `userId` và xử lý request với danh tính/quyền tương ứng.

Khi logout, server nên xóa hoặc vô hiệu hóa session trong session store và yêu cầu browser xóa cookie. Session cũng nên có thời hạn hết hạn và có thể bị thu hồi khi cần.

## Cookie là gì?

Cookie là một mẩu dữ liệu nhỏ do server yêu cầu browser lưu. Cookie được gửi lại tự động trong các request phù hợp với domain, path, thời hạn và các policy bảo mật của nó.

Browser quản lý cookie, không phải JavaScript của ứng dụng quyết định toàn bộ hành vi gửi cookie. Browser sẽ:

- Lưu cookie nhận từ header `Set-Cookie`.
- Gắn cookie phù hợp vào header `Cookie` của request sau.
- Kiểm tra domain, path, expiry và `Secure` trước khi gửi.
- Không cho JavaScript đọc cookie có `HttpOnly`.

Cookie thường dùng để giữ session ID, không nên chứa password hoặc dữ liệu nhạy cảm không cần thiết. Session data chính vẫn nằm ở server-side session store.

## Các thuộc tính của `Set-Cookie`

Ví dụ:

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

### `HttpOnly`

Cookie có `HttpOnly` không thể được đọc bằng JavaScript qua `document.cookie`. Điều này làm giảm nguy cơ một đoạn script do XSS đánh cắp session cookie.

`HttpOnly` không làm XSS biến mất: script độc hại vẫn có thể thực hiện request trong ngữ cảnh browser của user. Vì vậy vẫn cần xử lý input/output đúng cách, CSP phù hợp và các biện pháp chống XSS khác.

### `Secure`

Cookie có `Secure` chỉ được gửi qua HTTPS, không gửi qua HTTP thường. Điều này giúp chống việc session ID bị đọc trên đường truyền không mã hóa.

Production nên dùng HTTPS cho toàn bộ ứng dụng. Khi dùng `SameSite=None`, browser hiện đại yêu cầu cookie cũng phải có `Secure`.

### `SameSite` và CSRF

`SameSite` quyết định browser có gửi cookie trong một số request cross-site hay không. Cookie session thường nên đặt rõ thuộc tính này:

- **`SameSite=Strict`:** hạn chế nhất. Cookie gần như chỉ được gửi trong ngữ cảnh same-site. Bảo vệ CSRF tốt hơn nhưng có thể làm một số luồng đi từ website khác vào ứng dụng kém thuận tiện.
- **`SameSite=Lax`:** cân bằng phổ biến. Cookie vẫn được gửi trong các điều hướng top-level an toàn như mở link GET, nhưng thường không được gửi trong các request cross-site nguy hiểm như form POST. Đây thường là lựa chọn mặc định phù hợp cho session.
- **`SameSite=None`:** cho phép gửi cookie trong ngữ cảnh cross-site. Cần dùng kèm `Secure`, và chỉ nên dùng khi ứng dụng thực sự cần third-party hoặc cross-site cookie. Khi đó cần có biện pháp CSRF riêng, chẳng hạn CSRF token hoặc kiểm tra `Origin`/`Referer`.

`SameSite` là một lớp phòng thủ CSRF, không phải lý do để bỏ qua CSRF protection. Các request thay đổi dữ liệu vẫn cần được thiết kế và kiểm tra phù hợp.

## Checklist ngắn

- Session ID là giá trị ngẫu nhiên, không phải email hay password.
- Session record được lưu server-side và có `userId`, expiry, thông tin cần thiết.
- Cookie session đặt `HttpOnly`, `Secure` trong production và `SameSite` phù hợp.
- Không ghi session ID vào log không cần thiết.
- Xóa/revoke session khi logout và hỗ trợ expiry/rotation khi cần.
