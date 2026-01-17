-- ═══════════════════════════════════════════════════════════════════
-- Fix: Insert user with your actual RFID card
-- ═══════════════════════════════════════════════════════════════════

USE smart_dustbin_pro;

-- Insert a user with your real RFID (56:49:0F:05)
INSERT INTO users (full_name, username, password, rfid_uid, current_points, total_recycled_items, carbon_saved_g, role, department)
VALUES 
    ('Avijit Roy', 'avijit', 'password123', '56:49:0F:05', 0, 0, 0, 'user', 'Computer Science');

-- Verify it was inserted
SELECT * FROM users WHERE rfid_uid = '56:49:0F:05';

-- ═══════════════════════════════════════════════════════════════════
-- Optional: Add more RFID cards if you have them
-- ═══════════════════════════════════════════════════════════════════

-- Example for additional cards:
-- INSERT INTO users (full_name, username, password, rfid_uid, role, department)
-- VALUES ('Student Name', 'username', 'password', 'AA:BB:CC:DD', 'user', 'Engineering');
