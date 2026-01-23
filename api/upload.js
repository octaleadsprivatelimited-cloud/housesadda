// Vercel Serverless Function for file uploads to Supabase Storage
// Uses service role key for secure uploads

export default async function handler(req, res) {
  console.log('🔍 Upload handler:', req.method, req.url);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase client with service role key
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Supabase credentials not configured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get file from request
    const { file, fileName, folder, bucket } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ error: 'File and fileName are required' });
    }

    // Convert base64 to buffer if needed
    let fileBuffer;
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Base64 data URL
      const base64Data = file.split(',')[1];
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return res.status(400).json({ error: 'Invalid file format. Expected base64 data URL.' });
    }

    const filePath = `${folder || 'properties'}/${Date.now()}-${fileName}`;
    const targetBucket = bucket || 'admin-uploads';

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, fileBuffer, {
        contentType: req.body.contentType || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({
        error: 'Upload failed',
        message: error.message
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(filePath);

    console.log('✅ File uploaded successfully:', publicUrl);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

