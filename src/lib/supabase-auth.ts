// Frontend-only authentication using Supabase
import { supabase, adminAuth } from './supabase';

export const supabaseAuthAPI = {
  // Login using Supabase database function
  login: async (username: string, password: string) => {
    try {
      // Try using database function first (more secure)
      const result = await adminAuth.login(username, password);
      
      if (result.success) {
        return {
          success: true,
          user: result.user,
          token: result.token
        };
      }
      
      throw new Error('Invalid credentials');
    } catch (error: any) {
      // Fallback to simple login if database function fails
      console.warn('Database function login failed, trying simple login:', error);
      try {
        const result = await adminAuth.loginSimple(username, password);
        return {
          success: true,
          user: result.user,
          token: result.token
        };
      } catch (fallbackError: any) {
        throw new Error(fallbackError.message || 'Invalid credentials');
      }
    }
  },

  // Verify token (check if session is valid)
  verifyToken: async () => {
    try {
      const session = localStorage.getItem('adminSession');
      if (!session) {
        throw new Error('No session found');
      }

      const parsed = JSON.parse(session);
      if (!parsed.token || !parsed.user) {
        throw new Error('Invalid session');
      }

      // Decode token (simple base64 for now)
      try {
        const decoded = JSON.parse(atob(parsed.token));
        const now = Date.now();
        const tokenAge = now - (decoded.timestamp || 0);
        
        // Token expires after 24 hours
        if (tokenAge > 24 * 60 * 60 * 1000) {
          throw new Error('Session expired');
        }

        return {
          success: true,
          user: parsed.user
        };
      } catch {
        throw new Error('Invalid token');
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Token verification failed'
      };
    }
  },

  // Update credentials (requires current password)
  updateCredentials: async (
    currentPassword: string,
    newUsername?: string,
    newPassword?: string
  ) => {
    try {
      const session = localStorage.getItem('adminSession');
      if (!session) {
        throw new Error('Not authenticated');
      }

      const parsed = JSON.parse(session);
      const currentUsername = parsed.user?.username;

      if (!currentUsername) {
        throw new Error('Invalid session');
      }

      // Verify current password
      await adminAuth.login(currentUsername, currentPassword);

      // Update username if provided
      if (newUsername) {
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ username: newUsername })
          .eq('username', currentUsername);

        if (updateError) {
          throw new Error('Failed to update username');
        }
      }

      // Update password if provided
      if (newPassword) {
        // Note: Password hashing should be done via Supabase database function
        // For now, we'll need to use a database function or Edge Function
        // This is a limitation - password hashing requires server-side code
        throw new Error('Password update requires server-side function. Please use Supabase Dashboard or create a database function.');
      }

      return {
        success: true,
        message: 'Credentials updated successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update credentials');
    }
  }
};

