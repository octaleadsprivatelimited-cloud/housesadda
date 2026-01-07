-- Seed script to create default admin user
-- Run this after creating the schema

USE housesadda;

-- Update admin password (admin123)
-- This is a bcrypt hash for 'admin123'
-- To generate a new hash, use: bcrypt.hashSync('your-password', 10)
UPDATE admin_users 
SET password = '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
WHERE username = 'admin';

