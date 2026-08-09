-- Seed dữ liệu mẫu cho schema Day 7

INSERT INTO users (name, email) VALUES
('Nguyễn Văn A', 'a@example.com'),
('Trần Thị B', 'b@example.com');

INSERT INTO user_profiles (user_id, bio, website) VALUES
(1, 'Profile cho Nguyễn Văn A', 'https://example.com/a'),
(2, 'Profile cho Trần Thị B', 'https://example.com/b');

INSERT INTO authors (name, bio) VALUES
('William Shakespeare', 'Author of many plays.'),
('Jane Austen', 'Author of classic novels.');

INSERT INTO books (title, author_id, price) VALUES
('Hamlet', 1, 9.99),
('Pride and Prejudice', 2, 12.50);

INSERT INTO categories (name, description) VALUES
('Drama', 'Dramatic literature'),
('Classic', 'Classical literature');

INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1),
(2, 2),
(2, 1);
