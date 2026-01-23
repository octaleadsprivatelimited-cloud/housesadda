// Vercel Serverless Function for /api/locations/:id
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
  const { id } = req.query;
  console.log('🔍 Location handler:', req.method, 'ID:', id);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  let supabase;
  try {
    const { getSupabaseClient } = await import('../../_helpers/supabase.js');
    supabase = getSupabaseClient();
  } catch (configError) {
    console.error('❌ Configuration error:', configError.message);
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: configError.message
    });
  }

  // PUT - Update location (protected)
  if (req.method === 'PUT') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, city } = req.body;

      const { error } = await supabase
        .from('locations')
        .update({ name, city })
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Update location error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE - Delete location (protected)
  if (req.method === 'DELETE') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Delete location error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

