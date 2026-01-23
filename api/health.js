// Vercel Serverless Function for /api/health
export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  return res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    database: 'Supabase',
    url: process.env.SUPABASE_URL ? 'configured' : 'not configured'
  });
}

