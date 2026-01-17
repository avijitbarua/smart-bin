-- Migration: Add image_url column to waste_logs table
-- Run this if your existing database doesn't have the image_url column

USE smart_dustbin_pro;

-- Check if column exists and add if it doesn't
ALTER TABLE waste_logs 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) AFTER points_earned;

-- Verify the change
DESCRIBE waste_logs;

SELECT 'Migration completed: image_url column added to waste_logs table' AS status;
