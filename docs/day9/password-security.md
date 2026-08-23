# Password Security

## Vì sao không được lưu password plain text?

Lưu password dạng plain text nghĩa là database chứa đúng chuỗi mà người dùng nhập. Đây là một sai lầm nghiêm trọng vì:

- **Database bị lộ:** kẻ tấn công có thể đăng nhập ngay vào tài khoản của người dùng. Nhiều người còn dùng lại password ở email, mạng xã hội hoặc dịch vụ khác, nên thiệt hại có thể lan sang nhiều hệ thống.
- **Nhân viên nội bộ hoặc người có quyền truy cập DB:** bất kỳ ai đọc được bảng user đều có thể xem password thật. Không nên phải tin rằng mọi người có quyền đọc dữ liệu sẽ không bao giờ lạm dụng quyền đó.
- **Log, backup và môi trường test:** password có thể vô tình xuất hiện trong request log, error log, file dump, bản backup hoặc dữ liệu dùng để test. Những bản sao này thường bị quên bảo vệ.
- **Khó giảm phạm vi sự cố:** khi password thật đã bị lộ thì không thể thu hồi chuỗi đó như thu hồi một session token. Người dùng phải đổi password ở mọi nơi đã dùng lại nó.

Ứng dụng **không cần biết password gốc**. Ứng dụng chỉ cần kiểm tra password người dùng nhập có khớp với giá trị đã lưu hay không.

## Encryption và Hashing

| Đặc điểm | Encryption (mã hóa) | Hashing (băm) |
| --- | --- | --- |
| Có thể khôi phục dữ liệu gốc? | Có, nếu có key | Không được thiết kế để khôi phục |
| Mục đích phù hợp | Bảo vệ dữ liệu cần đọc lại, ví dụ nội dung bí mật | Kiểm tra dữ liệu có khớp, ví dụ password |
| Cần bảo vệ thêm | Encryption key | Thuật toán, cost và database hash |
| Dùng cho password? | Không phù hợp | Phù hợp |

Password cần được **hash**, không phải encrypt. Nếu encrypt password, hệ thống phải giữ encryption key và ai lấy được key có thể giải mã toàn bộ password. Với hashing, lúc đăng nhập hệ thống hash/verify password người dùng nhập và so sánh kết quả, không cần khôi phục password gốc.

Không nên dùng hash nhanh như MD5 hoặc SHA-1/SHA-256 một cách đơn độc để lưu password. Hash password cần chậm và có cost có thể điều chỉnh, chẳng hạn bcrypt, scrypt hoặc Argon2.

## Salt là gì?

**Salt** là một chuỗi ngẫu nhiên, riêng biệt cho mỗi password, được đưa vào quá trình hash. Hai người dùng có cùng password vẫn phải tạo ra hai password hash khác nhau.

Salt giúp chống **Rainbow Table**: rainbow table là các bảng được tính trước, ánh xạ những password phổ biến với hash của chúng. Vì mỗi password có salt ngẫu nhiên khác nhau, hash được tạo ra không còn khớp với bảng tính trước đó.

Salt không phải là password và cũng không cần giữ bí mật. Salt thường được lưu cùng hash để lần đăng nhập sau có thể dùng lại. Thư viện như bcrypt tự tạo salt và đóng gói salt vào chuỗi hash trả về, nên ứng dụng thường không cần tự tạo hoặc lưu cột salt riêng.

Salt không thay thế password hashing chậm: nó chống việc dùng lại kết quả tính trước, còn cost factor làm cho việc thử từng password trở nên tốn thời gian hơn.

## bcrypt/bcryptjs trong Node.js

Cài một trong hai thư viện:

```bash
npm install bcrypt
# hoặc
npm install bcryptjs
```

Hai thư viện có API tương tự. `bcrypt` thường dùng native binding nên có thể cần môi trường build phù hợp; `bcryptjs` là bản JavaScript thuần.

### Đăng ký: `bcrypt.hash`

```js
import bcrypt from 'bcrypt'; // hoặc: import bcrypt from 'bcryptjs';

const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Chỉ lưu passwordHash vào database, không lưu password.
await users.create({ email, passwordHash });
```

`bcrypt.hash(password, saltRounds)` tự tạo salt ngẫu nhiên và trả về một chuỗi hash chứa cả salt lẫn thông tin cost. Không log `password`, không trả password trong response và không lưu password plain text trong database.

### Đăng nhập: `bcrypt.compare`

```js
const user = await users.findByEmail(email);

const isValid = user && await bcrypt.compare(password, user.passwordHash);

if (!isValid) {
  throw new Error('Email hoặc password không đúng');
}

// Tạo session hoặc access token sau khi xác thực thành công.
```

`bcrypt.compare(plain, hash)` nhận password người dùng vừa nhập và hash đã lưu. Nó tự đọc salt và cost từ `hash`, sau đó kiểm tra kết quả. Không hash lại bằng salt mới rồi so sánh chuỗi một cách thủ công.

### `saltRounds` và cost factor

`saltRounds` là **cost factor**, không phải số lượng salt. Cost càng cao thì bcrypt càng thực hiện nhiều công việc CPU hơn; theo quy ước bcrypt, chi phí tăng theo lũy thừa của 2. Điều này làm việc đoán password hàng loạt sau khi DB bị lộ tốn thời gian hơn, nhưng cũng làm mỗi lần đăng ký hoặc đăng nhập chậm hơn.

- Không đặt cost quá thấp chỉ để request nhanh hơn; cost thấp làm password dễ bị brute-force hơn.
- Giá trị thường gặp là khoảng `10` đến `12`, nhưng cần benchmark trên phần cứng và giới hạn latency thực tế của ứng dụng.
- Có thể tăng cost theo thời gian. Khi người dùng đăng nhập thành công, ứng dụng có thể kiểm tra cost cũ và hash lại bằng cost mới.
- Không chọn một con số mù quáng: đo thời gian `hash` trong môi trường production tương tự, đồng thời theo dõi CPU và khả năng chịu tải.

bcrypt chỉ bảo vệ password hash khi hệ thống lưu trữ đúng cách. Vẫn cần HTTPS, không ghi password vào log, giới hạn quyền đọc database, bảo vệ backup và dùng thông báo đăng nhập lỗi chung để tránh lộ email nào tồn tại.
