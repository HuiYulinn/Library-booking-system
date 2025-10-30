-- 创建数据库
CREATE DATABASE IF NOT EXISTS library_booking DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE library_booking;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 座位表
CREATE TABLE IF NOT EXISTS seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seat_number VARCHAR(20) NOT NULL UNIQUE,
    area VARCHAR(50) NOT NULL COMMENT '区域名称，如：一楼阅览室、二楼自习室',
    floor INT NOT NULL COMMENT '楼层',
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available' COMMENT '座位状态',
    has_power BOOLEAN DEFAULT FALSE COMMENT '是否有电源插座',
    has_lamp BOOLEAN DEFAULT FALSE COMMENT '是否有台灯',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_area (area),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 预约记录表
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    seat_id INT NOT NULL,
    booking_date DATE NOT NULL COMMENT '预约日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'overdue') DEFAULT 'pending' COMMENT '预约状态',
    check_in_time DATETIME COMMENT '签到时间',
    check_out_time DATETIME COMMENT '签退时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_seat_id (seat_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status),
    UNIQUE KEY unique_seat_time (seat_id, booking_date, start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入示例数据
-- 插入测试用户
INSERT INTO users (username, password, name, email, phone) VALUES
('student001', 'password123', '张三', 'zhangsan@example.com', '13800138001'),
('student002', 'password123', '李四', 'lisi@example.com', '13800138002'),
('student003', 'password123', '王五', 'wangwu@example.com', '13800138003');

-- 插入座位数据
INSERT INTO seats (seat_number, area, floor, status, has_power, has_lamp) VALUES
-- 一楼阅览室
('A101', '一楼阅览室', 1, 'available', TRUE, TRUE),
('A102', '一楼阅览室', 1, 'available', TRUE, TRUE),
('A103', '一楼阅览室', 1, 'available', FALSE, TRUE),
('A104', '一楼阅览室', 1, 'available', TRUE, FALSE),
('A105', '一楼阅览室', 1, 'available', TRUE, TRUE),
('A106', '一楼阅览室', 1, 'available', FALSE, TRUE),
('A107', '一楼阅览室', 1, 'available', TRUE, TRUE),
('A108', '一楼阅览室', 1, 'available', TRUE, TRUE),
('A109', '一楼阅览室', 1, 'available', FALSE, FALSE),
('A110', '一楼阅览室', 1, 'available', TRUE, TRUE),
-- 二楼自习室
('B201', '二楼自习室', 2, 'available', TRUE, TRUE),
('B202', '二楼自习室', 2, 'available', TRUE, TRUE),
('B203', '二楼自习室', 2, 'available', TRUE, FALSE),
('B204', '二楼自习室', 2, 'available', FALSE, TRUE),
('B205', '二楼自习室', 2, 'available', TRUE, TRUE),
('B206', '二楼自习室', 2, 'available', TRUE, TRUE),
('B207', '二楼自习室', 2, 'available', FALSE, TRUE),
('B208', '二楼自习室', 2, 'available', TRUE, TRUE),
('B209', '二楼自习室', 2, 'available', TRUE, FALSE),
('B210', '二楼自习室', 2, 'available', TRUE, TRUE),


-- 插入一些示例预约
INSERT INTO bookings (user_id, seat_id, booking_date, start_time, end_time, status) VALUES
(1, 1, CURDATE(), '09:00:00', '12:00:00', 'confirmed'),
(2, 5, CURDATE(), '14:00:00', '17:00:00', 'confirmed'),
(3, 11, CURDATE(), '09:00:00', '18:00:00', 'confirmed');

