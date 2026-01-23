-- HousesAdda Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Property Types Table
CREATE TABLE IF NOT EXISTS property_types (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, city)
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location_id BIGINT NOT NULL,
  type_id BIGINT NOT NULL,
  city VARCHAR(50) DEFAULT 'Hyderabad',
  price DECIMAL(15, 2) NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  sqft INTEGER DEFAULT 0,
  description TEXT,
  transaction_type VARCHAR(20) DEFAULT 'Sale',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  amenities JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  brochure_url VARCHAR(500),
  map_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (type_id) REFERENCES property_types(id) ON DELETE RESTRICT
);

-- Property Images Table
CREATE TABLE IF NOT EXISTS property_images (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location_id);
CREATE INDEX IF NOT EXISTS idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_images_property ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for properties
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt (salt rounds: 10)
INSERT INTO admin_users (username, password) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (username) DO NOTHING;

-- Insert default property types
INSERT INTO property_types (name) VALUES 
('Apartment'),
('Villa'),
('Plot'),
('Commercial'),
('PG')
ON CONFLICT (name) DO NOTHING;

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
ON CONFLICT (name, city) DO NOTHING;

-- Enable Row Level Security (RLS) - Optional, for additional security
-- Uncomment if you want to use RLS policies

-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and customize as needed):
-- CREATE POLICY "Allow public read access to properties" ON properties
--   FOR SELECT USING (is_active = true);

-- CREATE POLICY "Allow public read access to property_types" ON property_types
--   FOR SELECT USING (true);

-- CREATE POLICY "Allow public read access to locations" ON locations
--   FOR SELECT USING (true);

