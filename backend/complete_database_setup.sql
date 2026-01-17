-- ═══════════════════════════════════════════════════════════════════════════
-- BARAQA_BIN Smart Waste Management System
-- Complete Database Setup with Bangladesh-Based Dummy Data
-- ═══════════════════════════════════════════════════════════════════════════

DROP DATABASE IF EXISTS smart_dustbin_pro;
CREATE DATABASE smart_dustbin_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_dustbin_pro;

-- ───────────────────────────────────────────────────────────────────────────
-- TABLE 1: Users (Students & Staff)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rfid_uid VARCHAR(50) NOT NULL UNIQUE,
    current_points INT DEFAULT 0,
    total_recycled_items INT DEFAULT 0,
    carbon_saved_g FLOAT DEFAULT 0.0,
    role ENUM('admin', 'user') DEFAULT 'user',
    department VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- TABLE 2: Smart Bins
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE smart_bins (
    bin_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_name VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    max_capacity INT DEFAULT 500,
    current_fill_level INT DEFAULT 0,
    battery_status INT DEFAULT 100,
    last_emptied_at DATETIME,
    status ENUM('active', 'full', 'maintenance') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- TABLE 3: Waste Logs
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE waste_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bin_id INT NOT NULL,
    waste_type VARCHAR(30) NOT NULL,
    waste_count INT DEFAULT 1,
    points_earned INT DEFAULT 0,
    image_url VARCHAR(500),
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (bin_id) REFERENCES smart_bins(bin_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- TABLE 4: Rewards
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE rewards (
    reward_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    points_required INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT DUMMY DATA - BANGLADESH CONTEXT
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1. INSERT USERS (Bangladesh University Students & Staff)
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO users (full_name, username, password, rfid_uid, current_points, total_recycled_items, carbon_saved_g, role, department) VALUES
-- Your real RFID card (MUST MATCH YOUR HARDWARE)
('Avijit Roy', 'avijit', 'admin123', '56:49:0F:05', 350, 35, 1750.0, 'admin', 'Computer Science'),

-- Top performing students
('Fatima Rahman', 'fatima.r', 'pass123', 'AA:BB:CC:01', 1420, 142, 7100.0, 'user', 'Environmental Science'),
('Rakib Hossain', 'rakib.h', 'pass123', 'AA:BB:CC:02', 1280, 128, 6400.0, 'user', 'Civil Engineering'),
('Nusrat Jahan', 'nusrat.j', 'pass123', 'AA:BB:CC:03', 1150, 115, 5750.0, 'user', 'Business Administration'),
('Tanvir Ahmed', 'tanvir.a', 'pass123', 'AA:BB:CC:04', 980, 98, 4900.0, 'user', 'Computer Science'),

-- Active students
('Sadia Islam', 'sadia.i', 'pass123', 'AA:BB:CC:05', 850, 85, 4250.0, 'user', 'Architecture'),
('Mehedi Hasan', 'mehedi.h', 'pass123', 'AA:BB:CC:06', 720, 72, 3600.0, 'user', 'Electrical Engineering'),
('Tasnim Akter', 'tasnim.a', 'pass123', 'AA:BB:CC:07', 650, 65, 3250.0, 'user', 'Pharmacy'),
('Sabbir Khan', 'sabbir.k', 'pass123', 'AA:BB:CC:08', 580, 58, 2900.0, 'user', 'Textile Engineering'),

-- Medium activity students  
('Mahmudul Islam', 'mahmudul.i', 'pass123', 'AA:BB:CC:09', 420, 42, 2100.0, 'user', 'Mathematics'),
('Farzana Yasmin', 'farzana.y', 'pass123', 'AA:BB:CC:10', 380, 38, 1900.0, 'user', 'English Literature'),
('Imran Chowdhury', 'imran.c', 'pass123', 'AA:BB:CC:11', 310, 31, 1550.0, 'user', 'Economics'),
('Shirin Sultana', 'shirin.s', 'pass123', 'AA:BB:CC:12', 270, 27, 1350.0, 'user', 'Law'),

-- New students
('Asif Mahmud', 'asif.m', 'pass123', 'AA:BB:CC:13', 150, 15, 750.0, 'user', 'Marketing'),
('Rupa Das', 'rupa.d', 'pass123', 'AA:BB:CC:14', 120, 12, 600.0, 'user', 'Chemistry'),
('Fahim Shahriar', 'fahim.s', 'pass123', 'AA:BB:CC:15', 80, 8, 400.0, 'user', 'Mechanical Engineering');

-- ───────────────────────────────────────────────────────────────────────────
-- 2. INSERT SMART BINS (Bangladesh Campus Locations)
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO smart_bins (bin_name, location, max_capacity, current_fill_level, battery_status, status, last_emptied_at) VALUES
('Main Gate Bin', 'Main Entrance - University Gate', 500, 210, 88, 'active', '2026-01-17 06:00:00'),
('Cafeteria Bin A', 'Student Cafeteria - Ground Floor', 600, 485, 73, 'active', '2026-01-17 07:30:00'),
('Library Bin', 'Central Library - 2nd Floor', 400, 320, 55, 'active', '2026-01-16 18:00:00'),
('TSC Bin', 'Teacher-Student Center (TSC)', 550, 490, 62, 'full', '2026-01-16 08:00:00'),
('Admin Building Bin', 'Administrative Building - Lobby', 450, 180, 91, 'active', '2026-01-17 09:00:00'),
('Science Complex Bin', 'Science Building - Corridor', 500, 75, 45, 'maintenance', '2026-01-15 10:00:00'),
('Sports Complex Bin', 'Indoor Stadium Entrance', 400, 285, 82, 'active', '2026-01-17 05:00:00'),
('Auditorium Bin', 'Main Auditorium - Front Hall', 350, 140, 95, 'active', '2026-01-17 11:00:00');

-- ───────────────────────────────────────────────────────────────────────────
-- 3. INSERT WASTE LOGS (Realistic Activity History)
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO waste_logs (user_id, bin_id, waste_type, waste_count, points_earned, image_url, detected_at) VALUES
-- Recent activity (Today - Jan 18, 2026)
(2, 1, 'Plastic Bottle', 3, 30, 'https://iili.io/sample1.jpg', '2026-01-18 09:15:00'),
(3, 2, 'Can', 2, 20, 'https://iili.io/sample2.jpg', '2026-01-18 08:45:00'),
(4, 1, 'Paper', 5, 50, 'https://iili.io/sample3.jpg', '2026-01-18 08:20:00'),
(5, 3, 'Plastic Bottle', 4, 40, 'https://iili.io/sample4.jpg', '2026-01-18 07:55:00'),

-- Yesterday (Jan 17, 2026)
(2, 2, 'Can', 6, 60, 'https://iili.io/sample5.jpg', '2026-01-17 18:30:00'),
(3, 1, 'Plastic Bottle', 8, 80, 'https://iili.io/sample6.jpg', '2026-01-17 17:45:00'),
(6, 4, 'Paper', 3, 30, 'https://iili.io/sample7.jpg', '2026-01-17 16:20:00'),
(7, 2, 'Bottle', 2, 20, 'https://iili.io/sample8.jpg', '2026-01-17 15:10:00'),
(4, 1, 'Can', 4, 40, 'https://iili.io/sample9.jpg', '2026-01-17 14:35:00'),
(8, 3, 'Plastic', 5, 50, 'https://iili.io/sample10.jpg', '2026-01-17 13:50:00'),

-- Past week activity
(2, 1, 'Bottle', 7, 70, 'https://iili.io/sample11.jpg', '2026-01-16 10:15:00'),
(9, 2, 'Can', 3, 30, 'https://iili.io/sample12.jpg', '2026-01-16 11:25:00'),
(10, 4, 'Paper', 6, 60, 'https://iili.io/sample13.jpg', '2026-01-15 09:40:00'),
(3, 1, 'Plastic Bottle', 5, 50, 'https://iili.io/sample14.jpg', '2026-01-15 14:20:00'),
(11, 3, 'Can', 4, 40, 'https://iili.io/sample15.jpg', '2026-01-14 16:10:00'),
(4, 2, 'Bottle', 8, 80, 'https://iili.io/sample16.jpg', '2026-01-14 12:30:00'),
(5, 1, 'Paper', 2, 20, 'https://iili.io/sample17.jpg', '2026-01-13 15:45:00'),
(12, 4, 'Plastic', 6, 60, 'https://iili.io/sample18.jpg', '2026-01-13 08:55:00'),
(6, 2, 'Can', 3, 30, 'https://iili.io/sample19.jpg', '2026-01-12 17:20:00'),
(13, 1, 'Bottle', 5, 50, 'https://iili.io/sample20.jpg', '2026-01-12 11:40:00');

-- ───────────────────────────────────────────────────────────────────────────
-- 4. INSERT REWARDS (Bangladesh Context)
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO rewards (title, points_required, is_available) VALUES
('Free Tea at Cafeteria', 100, TRUE),
('Free Photocopy (50 pages)', 200, TRUE),
('Library Late Fee Waiver', 300, TRUE),
('Free Lunch Coupon', 500, TRUE),
('Bookstore 10% Discount', 750, TRUE),
('Free Printing (100 pages)', 1000, TRUE),
('University T-Shirt', 1500, TRUE),
('Eco Champion Certificate', 2000, TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Check all tables
SELECT '✓ Users Table' AS Status, COUNT(*) AS Total FROM users;
SELECT '✓ Smart Bins Table' AS Status, COUNT(*) AS Total FROM smart_bins;
SELECT '✓ Waste Logs Table' AS Status, COUNT(*) AS Total FROM waste_logs;
SELECT '✓ Rewards Table' AS Status, COUNT(*) AS Total FROM rewards;

-- Verify your RFID
SELECT '✓ Your RFID Card' AS Status, full_name, rfid_uid, current_points 
FROM users WHERE rfid_uid = '56:49:0F:05';

-- Top 5 students
SELECT '✓ Top 5 Students' AS Leaderboard, full_name, department, current_points 
FROM users WHERE role = 'user' ORDER BY current_points DESC LIMIT 5;

-- Bin status
SELECT '✓ Bin Status' AS Monitor, bin_name, location, 
       CONCAT(ROUND(current_fill_level/max_capacity*100, 1), '%') AS Fill_Level,
       status 
FROM smart_bins;

-- ═══════════════════════════════════════════════════════════════════════════
-- SETUP COMPLETE! 
-- Now restart Flask backend: python app.py
-- Then start React frontend: npm run dev
-- ═══════════════════════════════════════════════════════════════════════════
