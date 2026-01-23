// Vercel Serverless Function for /api/properties
// Handles GET (list all), POST (create)

import { createClient } from '@supabase/supabase-js';

// Helper to get images for a property
async function getPropertyImages(supabase, propertyId) {
  try {
    const { data: images, error } = await supabase
      .from('property_images')
      .select('image_url')
      .eq('property_id', propertyId)
      .order('display_order', { ascending: true });

    if (error) return [];
    return images.map(img => img.image_url);
  } catch (error) {
    return [];
  }
}

// Helper to verify JWT token
async function verifyToken(token) {
  if (!token) return null;
  try {
    const jwt = await import('jsonwebtoken');
    return jwt.default.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  console.log('🔍 Properties handler:', req.method, req.url);

  // CORS headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  // Initialize Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // GET - List all properties
  if (req.method === 'GET') {
    try {
      const { search, type, city, area, featured, active, transactionType } = req.query;

      let locationId = null;
      let typeId = null;

      if (area || city) {
        let locationQuery = supabase.from('locations').select('id');
        if (area) locationQuery = locationQuery.eq('name', area);
        if (city) locationQuery = locationQuery.eq('city', city);
        const { data: location } = await locationQuery.single();
        if (location) locationId = location.id;
      }

      if (type) {
        const { data: typeRow } = await supabase
          .from('property_types')
          .select('id')
          .eq('name', type)
          .single();
        if (typeRow) typeId = typeRow.id;
      }

      let query = supabase
        .from('properties')
        .select(`
          *,
          locations:location_id (id, name, city),
          property_types:type_id (id, name)
        `);

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (typeId) query = query.eq('type_id', typeId);
      if (locationId) query = query.eq('location_id', locationId);
      if (featured !== undefined) query = query.eq('is_featured', featured === 'true');
      if (active !== undefined) query = query.eq('is_active', active === 'true');
      if (transactionType && String(transactionType).trim() !== '' && String(transactionType).trim() !== 'undefined') {
        query = query.eq('transaction_type', String(transactionType).trim());
      }

      query = query.order('created_at', { ascending: false });

      const { data: properties, error } = await query;

      if (error) throw error;

      const formattedProperties = await Promise.all((properties || []).map(async (prop) => {
        const images = await getPropertyImages(supabase, prop.id);
        return {
          id: prop.id,
          title: prop.title,
          type: prop.property_types?.name || '',
          area: prop.locations?.name || '',
          city: prop.city || 'Hyderabad',
          price: prop.price,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          sqft: prop.sqft,
          description: prop.description,
          transactionType: prop.transaction_type || 'Sale',
          image: images[0] || null,
          images: images,
          isFeatured: prop.is_featured === true || prop.is_featured === 1,
          isActive: prop.is_active === true || prop.is_active === 1,
          amenities: typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : (prop.amenities || []),
          highlights: typeof prop.highlights === 'string' ? JSON.parse(prop.highlights) : (prop.highlights || []),
          brochureUrl: prop.brochure_url,
          mapUrl: prop.map_url,
          videoUrl: prop.video_url,
          createdAt: prop.created_at
        };
      }));

      return res.status(200).json(formattedProperties);
    } catch (error) {
      console.error('❌ Get properties error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST - Create property (protected)
  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        title, type, city, area, price, bedrooms, bathrooms, sqft,
        description, images, isFeatured, isActive, amenities, highlights,
        brochureUrl, mapUrl, videoUrl, transactionType
      } = req.body;

      if (!title || !type || !area || !price) {
        return res.status(400).json({ error: 'Title, type, area, and price are required' });
      }

      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('name', area)
        .eq('city', city || 'Hyderabad')
        .single();

      const { data: typeRow } = await supabase
        .from('property_types')
        .select('id')
        .eq('name', type)
        .single();

      if (!location || !typeRow) {
        return res.status(400).json({ error: 'Invalid location or type' });
      }

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          title,
          location_id: location.id,
          type_id: typeRow.id,
          city: city || 'Hyderabad',
          price: parseFloat(price) || 0,
          bedrooms: parseInt(bedrooms) || 0,
          bathrooms: parseInt(bathrooms) || 0,
          sqft: parseInt(sqft) || 0,
          description: description || '',
          transaction_type: transactionType || 'Sale',
          is_featured: isFeatured ? true : false,
          is_active: isActive !== false,
          amenities: amenities || [],
          highlights: highlights || [],
          brochure_url: brochureUrl || '',
          map_url: mapUrl || '',
          video_url: videoUrl || ''
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      if (images && images.length > 0) {
        const imageRecords = images.map((url, index) => ({
          property_id: property.id,
          image_url: url,
          display_order: index
        }));

        await supabase.from('property_images').insert(imageRecords);
      }

      return res.status(200).json({ success: true, id: property.id });
    } catch (error) {
      console.error('❌ Create property error:', error);
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

