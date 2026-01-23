// Vercel Serverless Function for /api/properties/:id
// Handles GET (single), PUT (update), DELETE

import { createClient } from '@supabase/supabase-js';

async function getPropertyImages(supabase, propertyId) {
  try {
    const { data: images } = await supabase
      .from('property_images')
      .select('image_url')
      .eq('property_id', propertyId)
      .order('display_order', { ascending: true });
    return images?.map(img => img.image_url) || [];
  } catch {
    return [];
  }
}

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
  console.log('🔍 Property handler:', req.method, req.url, 'ID:', id);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // GET - Single property
  if (req.method === 'GET') {
    try {
      const { data: prop, error } = await supabase
        .from('properties')
        .select(`
          *,
          locations:location_id (id, name, city),
          property_types:type_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (error || !prop) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const images = await getPropertyImages(supabase, id);

      const property = {
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

      return res.status(200).json(property);
    } catch (error) {
      console.error('❌ Get property error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT - Update property (protected)
  if (req.method === 'PUT') {
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

      const { error: updateError } = await supabase
        .from('properties')
        .update({
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
          is_active: isActive ? true : false,
          amenities: amenities || [],
          highlights: highlights || [],
          brochure_url: brochureUrl || '',
          map_url: mapUrl || '',
          video_url: videoUrl || ''
        })
        .eq('id', id);

      if (updateError) throw updateError;

      if (images !== undefined) {
        await supabase.from('property_images').delete().eq('property_id', id);
        if (images.length > 0) {
          const imageRecords = images.map((url, index) => ({
            property_id: id,
            image_url: url,
            display_order: index
          }));
          await supabase.from('property_images').insert(imageRecords);
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Update property error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE - Delete property (protected)
  if (req.method === 'DELETE') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await supabase.from('property_images').delete().eq('property_id', id);
      const { error } = await supabase.from('properties').delete().eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Delete property error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

