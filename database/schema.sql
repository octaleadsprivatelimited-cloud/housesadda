-- HousesAdda Database Schema

CREATE DATABASE IF NOT EXISTS housesadda;
USE housesadda;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Property Types Table
CREATE TABLE IF NOT EXISTS property_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_location (name, city)
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location_id INT NOT NULL,
  type_id INT NOT NULL,
  city VARCHAR(50) DEFAULT 'Hyderabad',
  price DECIMAL(15, 2) NOT NULL,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  sqft INT DEFAULT 0,
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  amenities JSON,
  highlights JSON,
  brochure_url VARCHAR(500),
  map_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (type_id) REFERENCES property_types(id) ON DELETE RESTRICT,
  INDEX idx_featured (is_featured),
  INDEX idx_active (is_active),
  INDEX idx_type (type_id),
  INDEX idx_location (location_id)
);

-- Property Images Table
CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_property (property_id)
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt (salt rounds: 10)
-- To generate a new hash, run: node database/create-admin.js
-- Then update this file or run the UPDATE statement in MySQL
INSERT INTO admin_users (username, password) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Insert default property types
INSERT INTO property_types (name) VALUES 
('Apartment'),
('Villa'),
('Plot'),
('Commercial'),
('PG')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default locations
INSERT INTO locations (name, city) VALUES 
('Gachibowli', 'Hyderabad'),
('Hitech City', 'Hyderabad'),
('Kondapur', 'Hyderabad'),
('Jubilee Hills', 'Hyderabad'),
('Banjara Hills', 'Hyderabad'),
('Madhapur', 'Hyderabad'),
('Kukatpally', 'Hyderabad'),
('Miyapur', 'Hyderabad'),
('Kompally', 'Hyderabad'),
('Financial District', 'Hyderabad'),
('Shamirpet', 'Hyderabad')
ON DUPLICATE KEY UPDATE name=name;

