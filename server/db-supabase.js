import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials are missing!');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  throw new Error('Supabase credentials not configured');
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions to match SQLite/MySQL interface
export const dbGet = async (table, filters = {}) => {
  try {
    let query = supabase.from(table).select('*');
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });
    
    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in dbGet for ${table}:`, error);
    throw error;
  }
};

export const dbAll = async (table, filters = {}, orderBy = null) => {
  try {
    let query = supabase.from(table).select('*');
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (Array.isArray(filters[key])) {
        query = query.in(key, filters[key]);
      } else {
        query = query.eq(key, filters[key]);
      }
    });
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error in dbAll for ${table}:`, error);
    throw error;
  }
};

export const dbRun = async (table, operation, data, filters = {}) => {
  try {
    if (operation === 'insert') {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        lastID: result.id,
        changes: 1,
        data: result
      };
    } else if (operation === 'update') {
      let query = supabase.from(table).update(data);
      
      // Apply filters for WHERE clause
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      
      return {
        changes: result?.length || 0,
        data: result
      };
    } else if (operation === 'delete') {
      let query = supabase.from(table).delete();
      
      // Apply filters for WHERE clause
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      
      return {
        changes: result?.length || 0
      };
    }
  } catch (error) {
    console.error(`Error in dbRun for ${table}:`, error);
    throw error;
  }
};

// Initialize database schema (run migrations)
export async function initDatabase() {
  try {
    console.log('✅ Connected to Supabase');
    console.log('📦 Using Supabase database');
    
    // Check if tables exist by querying them
    const tables = ['admin_users', 'property_types', 'locations', 'properties', 'property_images'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error && error.code === '42P01') {
          console.warn(`⚠️  Table ${table} does not exist. Please run the schema migration.`);
        } else {
          console.log(`✅ Table ${table} exists`);
        }
      } catch (e) {
        console.warn(`⚠️  Could not verify table ${table}:`, e.message);
      }
    }
    
    // Check and create default admin user
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    if (!adminUsers || adminUsers.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = bcrypt.default.hashSync('admin123', 10);
      
      const { error } = await supabase
        .from('admin_users')
        .insert({
          username: 'admin',
          password: hashedPassword
        });
      
      if (error) {
        console.error('Error creating admin user:', error);
      } else {
        console.log('✅ Admin user created (admin/admin123)');
      }
    }
    
    // Check and create default property types
    const { data: types } = await supabase
      .from('property_types')
      .select('id')
      .limit(1);
    
    if (!types || types.length === 0) {
      const defaultTypes = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];
      const { error } = await supabase
        .from('property_types')
        .insert(defaultTypes.map(name => ({ name })));
      
      if (error) {
        console.error('Error creating property types:', error);
      } else {
        console.log('✅ Property types created');
      }
    }
    
    // Check and create default locations
    const { data: locations } = await supabase
      .from('locations')
      .select('id')
      .limit(1);
    
    if (!locations || locations.length === 0) {
      const defaultLocations = [
        { name: 'Gachibowli', city: 'Hyderabad' },
        { name: 'Hitech City', city: 'Hyderabad' },
        { name: 'Kondapur', city: 'Hyderabad' },
        { name: 'Jubilee Hills', city: 'Hyderabad' },
        { name: 'Banjara Hills', city: 'Hyderabad' },
        { name: 'Madhapur', city: 'Hyderabad' },
        { name: 'Kukatpally', city: 'Hyderabad' },
        { name: 'Miyapur', city: 'Hyderabad' },
        { name: 'Kompally', city: 'Hyderabad' },
        { name: 'Financial District', city: 'Hyderabad' },
        { name: 'Shamirpet', city: 'Hyderabad' }
      ];
      
      const { error } = await supabase
        .from('locations')
        .insert(defaultLocations);
      
      if (error) {
        console.error('Error creating locations:', error);
      } else {
        console.log('✅ Default locations created');
      }
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Close database connection (Supabase doesn't need explicit closing)
export function closeDatabase() {
  return Promise.resolve();
}

export default supabase;

