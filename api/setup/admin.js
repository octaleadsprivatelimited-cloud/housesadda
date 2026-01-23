// Vercel Serverless Function to create admin user in Supabase
// Call this once after deploying to create the admin user
// DELETE this file after setup for security

export default async function handler(req, res) {
  console.log('🔍 Setup admin handler:', req.method, req.url);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase client
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

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('username', 'admin')
      .single();

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        user: existingUser
      });
    }

    // Create admin user
    const bcrypt = await import('bcryptjs');
    const hashedPassword = bcrypt.default.hashSync('admin123', 10);

    const { data: newUser, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        username: 'admin',
        password: hashedPassword
      })
      .select('id, username')
      .single();

    if (insertError) {
      console.error('❌ Error creating admin user:', insertError);
      return res.status(500).json({
        error: 'Failed to create admin user',
        message: insertError.message
      });
    }

    console.log('✅ Admin user created successfully');

    return res.status(200).json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        username: 'admin',
        password: 'admin123'
      },
      user: newUser
    });

  } catch (error) {
    console.error('❌ Setup admin error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

