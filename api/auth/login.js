// Vercel Serverless Function for /api/auth/login
// Handles OPTIONS preflight and POST login requests

export default async function handler(req, res) {
  console.log('🔍 Login handler:', req.method, req.url);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get Supabase client
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

    // Get admin user from Supabase
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.default.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for user:', username);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

