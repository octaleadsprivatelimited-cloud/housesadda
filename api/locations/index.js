// Vercel Serverless Function for /api/locations
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
  console.log('🔍 Locations handler:', req.method, req.url);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // GET - List all locations
  if (req.method === 'GET') {
    try {
      const { city } = req.query;
      let query = supabase.from('locations').select('*');

      if (city) {
        query = query.eq('city', city);
      }

      query = query.order('city', { ascending: true }).order('name', { ascending: true });

      const { data: locations, error } = await query;

      if (error) throw error;

      return res.status(200).json(locations || []);
    } catch (error) {
      console.error('❌ Get locations error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST - Create location (protected)
  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, city } = req.body;

      if (!name || !city) {
        return res.status(400).json({ error: 'Name and city are required' });
      }

      const { data, error } = await supabase
        .from('locations')
        .insert({ name, city })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Location already exists' });
        }
        throw error;
      }

      return res.status(200).json({ success: true, id: data.id });
    } catch (error) {
      console.error('❌ Create location error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

