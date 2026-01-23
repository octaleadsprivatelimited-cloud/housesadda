// Frontend Supabase client - uses only public environment variables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client for frontend use
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper to get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

// Helper for admin authentication (using admin_users table)
export const adminAuth = {
  // Login with username/password using Supabase database function
  login: async (username: string, password: string) => {
    try {
      // Call Supabase database function for authentication
      // This runs on Supabase, not Vercel, so it doesn't count as a serverless function
      const { data, error } = await supabase.rpc('verify_admin_credentials', {
        p_username: username,
        p_password: password
      });

      if (error) {
        console.error('Auth error:', error);
        throw new Error('Invalid credentials');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Invalid credentials');
      }

      // Generate a simple session token (or use JWT if needed)
      const token = btoa(JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        timestamp: Date.now()
      }));

      return {
        success: true,
        user: data.user,
        token: token
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Alternative: Simple login without password verification (less secure)
  // Use this if database function doesn't work
  loginSimple: async (username: string, password: string) => {
    try {
      // Get admin user from database
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('id, username')
        .eq('username', username)
        .single();

      if (userError || !user) {
        throw new Error('Invalid credentials');
      }

      // Generate session token
      const token = btoa(JSON.stringify({
        id: user.id,
        username: user.username,
        timestamp: Date.now()
      }));

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username
        },
        token: token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Get admin user by ID
  getAdminUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// File upload helper - direct to Supabase Storage (frontend-only)
export const uploadFile = async (
  file: File,
  bucket: string = 'admin-uploads',
  folder: string = 'properties'
): Promise<{ url: string; path: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload directly to Supabase Storage
    // Note: This requires the bucket to be public or proper RLS policies
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error: any) {
    console.error('File upload failed:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};

// Delete file helper
export const deleteFile = async (filePath: string, bucket: string = 'admin-uploads') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('File deletion failed:', error);
    throw new Error(error.message || 'Failed to delete file');
  }
};

export default supabase;

