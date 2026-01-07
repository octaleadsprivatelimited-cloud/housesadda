import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'database', 'housesadda.db');

// Create database directory if it doesn't exist
try {
  mkdirSync(join(__dirname, '..', 'database'), { recursive: true });
} catch (e) {
  // Directory already exists
}

// Create and configure database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Promisify database methods with proper lastID handling
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

// Initialize database schema
export async function initDatabase() {
  try {
    // Enable foreign keys
    await dbRun('PRAGMA foreign_keys = ON');

    // Create tables
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS property_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, city)
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        location_id INTEGER NOT NULL,
        type_id INTEGER NOT NULL,
        city TEXT DEFAULT 'Hyderabad',
        price REAL NOT NULL,
        bedrooms INTEGER DEFAULT 0,
        bathrooms INTEGER DEFAULT 0,
        sqft INTEGER DEFAULT 0,
        description TEXT,
        is_featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        amenities TEXT,
        highlights TEXT,
        brochure_url TEXT,
        map_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id),
        FOREIGN KEY (type_id) REFERENCES property_types(id)
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS property_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await dbRun('CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_images_property ON property_images(property_id)');

    // Insert default data if tables are empty
    const adminCount = await dbGet('SELECT COUNT(*) as count FROM admin_users');
    if (adminCount.count === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = bcrypt.default.hashSync('admin123', 10);
      await dbRun(
        'INSERT INTO admin_users (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✅ Admin user created (admin/admin123)');
    }

    const typeCount = await dbGet('SELECT COUNT(*) as count FROM property_types');
    if (typeCount.count === 0) {
      const types = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];
      for (const type of types) {
        await dbRun('INSERT INTO property_types (name) VALUES (?)', [type]);
      }
      console.log('✅ Property types created');
    }

    const locationCount = await dbGet('SELECT COUNT(*) as count FROM locations');
    if (locationCount.count === 0) {
      const locations = [
        ['Gachibowli', 'Hyderabad'],
        ['Hitech City', 'Hyderabad'],
        ['Kondapur', 'Hyderabad'],
        ['Jubilee Hills', 'Hyderabad'],
        ['Banjara Hills', 'Hyderabad'],
        ['Madhapur', 'Hyderabad'],
        ['Kukatpally', 'Hyderabad'],
        ['Miyapur', 'Hyderabad'],
        ['Kompally', 'Hyderabad'],
        ['Financial District', 'Hyderabad'],
        ['Shamirpet', 'Hyderabad']
      ];
      for (const [name, city] of locations) {
        await dbRun('INSERT OR IGNORE INTO locations (name, city) VALUES (?, ?)', [name, city]);
      }
      console.log('✅ Default locations created');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Close database connection
export function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default db;

