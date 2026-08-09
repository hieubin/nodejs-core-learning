# Toàn vẹn dữ liệu khi xóa parent

Khi bảng cha bị xóa, các bản ghi con có thể xử lý theo 3 cách khác nhau:

## ON DELETE CASCADE

Hành vi: nếu parent bị xóa, tất cả child tham chiếu đến parent đó cũng bị xóa tự động.

Ví dụ thực tế:
- `users` và `user_profiles`
- `books` và `book_categories`

Khi nào dùng?
- Child hoàn toàn phụ thuộc vào parent.
- Nếu parent bị xóa thì child không có giá trị độc lập.

Nguy cơ chọn sai:
- Nếu dùng CASCADE cho `authors` → `books`, xóa một tác giả có thể làm mất tất cả sách của tác giả đó.
- Trong LMS, nếu xóa khóa học cha mà cascade xóa luôn `student_courses`, học sinh có thể mất lịch sử đăng ký.

## ON DELETE SET NULL

Hành vi: nếu parent bị xóa, giá trị FK trong child được đặt về NULL.

Ví dụ thực tế:
- `books.author_id` nếu muốn giữ sách dù tác giả bị xóa, nhưng đánh dấu tác giả không còn.
- `orders.shipping_address_id` nếu muốn giữ order mà địa chỉ bị xóa.

Khi nào dùng?
- Child vẫn có ý nghĩa độc lập nhưng mối liên kết parent đã mất.
- FK có thể chấp nhận NULL.

Nguy cơ chọn sai:
- Nếu dùng SET NULL với bảng child không cho phép NULL, sẽ gây lỗi khi xóa parent.
- Nếu dùng SET NULL cho quan hệ thực sự là bắt buộc, dữ liệu child sẽ trở nên không đầy đủ và khó truy vấn.

## ON DELETE RESTRICT / NO ACTION

Hành vi: cấm xóa parent nếu còn child tham chiếu.

Ví dụ thực tế:
- `authors` và `books` khi không muốn xóa tác giả nếu sách còn tồn tại.
- `students` và `student_profiles` nếu profile cần giữ liên kết bắt buộc.

Khi nào dùng?
- Khi child cần parent để dữ liệu vẫn hợp lệ.
- Khi xóa parent có thể gây ra mất dữ liệu quan trọng.

Nguy cơ chọn sai:
- Nếu dùng RESTRICT với quan hệ nên cascade, sẽ làm hệ thống không thể xóa parent và gây lỗi thao tác.
- Nếu dùng RESTRICT với quan hệ không cần thiết, quản trị sẽ phải xóa child thủ công trước.

## Case ví dụ thiết kế sai

Bookstore:
- Nếu `authors` → `books` dùng CASCADE, xóa tác giả sẽ xóa hết sách, mất toàn bộ dữ liệu sản phẩm.
- Nếu muốn giữ sách, nên dùng RESTRICT hoặc SET NULL tùy yêu cầu.

LMS:
- `courses` và `student_courses` dùng CASCADE là thường hợp lý: xóa khóa học xóa luôn các đăng ký liên quan.
- Nhưng với `teachers` và `courses`, dùng CASCADE có thể làm mất khóa học khi xóa giáo viên, điều này thường không mong muốn.

## Day 7 schema hiện tại

Trong `sql/day7/001_schema_relations.sql`:
- `user_profiles.user_id` dùng `ON DELETE CASCADE` vì profile chỉ tồn tại khi user tồn tại.
- `books.author_id` dùng `ON DELETE RESTRICT` vì không muốn xóa author khi sách vẫn có.
- `book_categories` dùng `ON DELETE CASCADE` để xóa các liên kết khi `book` hoặc `category` bị xóa.

## Demo SQL

Xem `sql/day7/003_on_delete_demo.sql` để thử xóa parent và quan sát child.
