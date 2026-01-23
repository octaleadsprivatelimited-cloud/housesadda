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
  // Login with username/password from admin_users table
  login: async (username: string, password: string) => {
    try {
      // Get admin user from database
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !user) {
        throw new Error('Invalid credentials');
      }

      // Verify password using bcrypt (we'll need to do this via a function or API)
      // Since bcrypt is server-side only, we'll use the existing API for login
      // But store session in Supabase auth for file uploads
      
      // For now, we'll use the API route for login but Supabase for everything else
      // This is a hybrid approach until we can move auth fully to Supabase
      
      return { user, needsApiAuth: true };
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

// File upload helper - uses API route for secure uploads
export const uploadFile = async (
  file: File,
  bucket: string = 'admin-uploads',
  folder: string = 'properties'
): Promise<{ url: string; path: string }> => {
  try {
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const base64Data = await base64Promise;

    // Determine API URL
    const apiUrl = import.meta.env.VITE_API_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api');

    // Upload via API route (uses service role key)
    const response = await fetch(`${apiUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Data,
        fileName: file.name,
        folder: folder,
        bucket: bucket,
        contentType: file.type
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const result = await response.json();
    return {
      url: result.url,
      path: result.path
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

