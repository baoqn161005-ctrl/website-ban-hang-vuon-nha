-- Vườn Nhà - MySQL 5.7+/8 (utf8mb4). Có thể import bằng phpMyAdmin hoặc chạy "npm run setup" trong backend.
CREATE DATABASE IF NOT EXISTS vuon_nha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vuon_nha;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  price INT NOT NULL,
  old_price INT NOT NULL DEFAULT 0,           -- giá gốc (0 = không khuyến mãi)
  img VARCHAR(500) NOT NULL DEFAULT '',
  description TEXT,
  stock INT NOT NULL DEFAULT 0,               -- tồn kho
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(20) PRIMARY KEY,                 -- dạng DH12345678, cũng là nội dung chuyển khoản
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  address VARCHAR(300) NOT NULL,
  pay VARCHAR(10) NOT NULL,                   -- vietqr | cod
  total INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Chờ xác nhận',
  payment_status VARCHAR(10) NOT NULL DEFAULT 'unpaid',   -- unpaid | paid
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id), INDEX (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(20) NOT NULL,
  product_id INT NULL,
  name VARCHAR(200) NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (token_hash)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bank_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,
  tx_id VARCHAR(64) NOT NULL,
  amount INT NOT NULL,
  content VARCHAR(500),
  order_id VARCHAR(20) NULL,
  note VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tx (provider, tx_id)
) ENGINE=InnoDB;

-- Dữ liệu mẫu (INSERT IGNORE + id cố định nên chạy lại không bị trùng)
INSERT IGNORE INTO categories (id, name) VALUES (1,'Trái cây'),(2,'Rau củ'),(3,'Cây giống');
INSERT IGNORE INTO products (id, name, price, old_price, category_id, img, description, stock) VALUES
(1,'Cam sành Miền Tây',35000,45000,1,'https://loremflickr.com/480/360/orange,fruit?lock=1','Cam sành mọng nước, vị ngọt thanh. Giá theo kg.',40),
(2,'Dưa lưới Huỳnh Long',65000,0,1,'https://loremflickr.com/480/360/melon,fruit?lock=2','Dưa lưới ngọt thanh, trồng nhà kính.',25),
(3,'Sầu riêng Ri6',120000,150000,1,'https://loremflickr.com/480/360/durian?lock=3','Sầu riêng cơm vàng hạt lép, thơm béo.',15),
(4,'Cà chua bi',28000,0,2,'https://loremflickr.com/480/360/cherrytomato,tomato?lock=4','Cà chua bi sạch, hái trong ngày.',60),
(5,'Rau muống',12000,0,2,'https://loremflickr.com/480/360/vegetable,greens?lock=5','Rau muống trồng không thuốc trừ sâu.',80),
(6,'Cây ổi giống',45000,55000,3,'https://loremflickr.com/480/360/guava,tree?lock=6','Cây ổi giống ghép, cao khoảng 50cm.',30),
(7,'Xoài cát Hòa Lộc',85000,0,1,'https://loremflickr.com/480/360/mango,fruit?lock=7','Xoài cát chín cây, thịt dày, ngọt đậm.',35),
(8,'Chuối laba',30000,38000,1,'https://loremflickr.com/480/360/banana,fruit?lock=8','Chuối laba Đà Lạt, thơm và dẻo.',50),
(9,'Bưởi da xanh',50000,0,1,'https://loremflickr.com/480/360/pomelo,grapefruit?lock=9','Bưởi da xanh ruột hồng, ít hạt.',45),
(10,'Dâu tây Đà Lạt',150000,180000,1,'https://loremflickr.com/480/360/strawberry?lock=10','Dâu tây đỏ mọng, vị chua ngọt hài hòa.',20),
(11,'Xà lách thủy canh',18000,0,2,'https://loremflickr.com/480/360/lettuce?lock=11','Xà lách trồng thủy canh, giòn và sạch.',70),
(12,'Chôm chôm nhãn',40000,0,1,'https://loremflickr.com/480/360/rambutan,fruit?lock=12','Chôm chôm nhãn cùi dày, dễ tách hạt.',55);
