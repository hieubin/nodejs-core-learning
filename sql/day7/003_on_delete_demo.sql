-- Demo ON DELETE behavior cho Day 7

-- Đảm bảo schema đã được tạo và seed trước.

-- Xóa user với ON DELETE CASCADE trên user_profiles
SELECT 'Before delete user' AS note;
SELECT * FROM users;
SELECT * FROM user_profiles;

DELETE FROM users WHERE id = 1;

SELECT 'After delete user' AS note;
SELECT * FROM users;
SELECT * FROM user_profiles;

-- Xóa author với ON DELETE RESTRICT trên books
SELECT 'Before delete author' AS note;
SELECT * FROM authors;
SELECT * FROM books;

-- Câu lệnh này sẽ bị từ chối nếu còn sách tham chiếu tới author
-- vì books.author_id dùng RESTRICT.
DELETE FROM authors WHERE id = 2;

SELECT 'After delete author' AS note;
SELECT * FROM authors;
SELECT * FROM books;

-- Nếu muốn dùng SET NULL thay vì RESTRICT, cần sửa schema và cho phép NULL.
-- Ví dụ: ALTER TABLE books ALTER COLUMN author_id DROP NOT NULL;
-- ALTER TABLE books DROP CONSTRAINT fk_books_author;
-- ALTER TABLE books ADD CONSTRAINT fk_books_author FOREIGN KEY (author_id)
-- REFERENCES authors(id) ON DELETE SET NULL;
