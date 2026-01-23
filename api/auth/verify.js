// Vercel Serverless Function for /api/auth/verify
export default async function handler(req, res) {
  console.log('🔍 Verify handler:', req.method, req.url);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

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

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({ success: true, user });

  } catch (error) {
    console.error('❌ Verify error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

