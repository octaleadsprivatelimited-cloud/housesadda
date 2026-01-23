// Shared Supabase client helper with error handling
import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set. Please configure it in Vercel environment variables.');
  }

  if (!supabaseKey) {
    throw new Error('Supabase API key is not set. Please configure SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in Vercel environment variables.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function handleSupabaseError(error, res) {
  console.error('❌ Supabase error:', error);
  
  if (error.message && error.message.includes('environment variable')) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: error.message
    });
  }

  return res.status(500).json({
    error: 'Database error',
    message: error.message || 'An error occurred while accessing the database'
  });
}

