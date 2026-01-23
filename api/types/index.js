// Vercel Serverless Function for /api/types
import { createClient } from '@supabase/supabase-js';

async function verifyToken(token) {
  if (!token) return null;
  try {
    const jwt = await import('jsonwebtoken');
    return jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  console.log('🔍 Types handler:', req.method, req.url);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  let supabase;
  try {
    const { getSupabaseClient } = await import('../_helpers/supabase.js');
    supabase = getSupabaseClient();
  } catch (configError) {
    console.error('❌ Configuration error:', configError.message);
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: configError.message
    });
  }

  // GET - List all types
  if (req.method === 'GET') {
    try {
      const { data: types, error } = await supabase
        .from('property_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return res.status(200).json(types || []);
    } catch (error) {
      console.error('❌ Get types error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST - Create type (protected)
  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const { data, error } = await supabase
        .from('property_types')
        .insert({ name })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Property type already exists' });
        }
        throw error;
      }

      return res.status(200).json({ success: true, id: data.id });
    } catch (error) {
      console.error('❌ Create type error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

