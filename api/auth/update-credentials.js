// Vercel Serverless Function for /api/auth/update-credentials
export default async function handler(req, res) {
  console.log('🔍 Update credentials handler:', req.method, req.url);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }

  if (req.method !== 'PUT') {
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

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { currentPassword, newUsername, newPassword } = req.body;
    const userId = decoded.id;

    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.default.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const updateData = {};

    if (newUsername && newUsername !== user.username) {
      const { data: existingUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', newUsername)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      updateData.username = newUsername;
    }

    if (newPassword && newPassword.length >= 6) {
      const hashedPassword = await bcrypt.default.hash(newPassword, 10);
      updateData.password = hashedPassword;
    } else if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    }

    const { data: updatedUser } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('id', userId)
      .single();

    return res.status(200).json({
      success: true,
      message: 'Credentials updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update credentials error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

