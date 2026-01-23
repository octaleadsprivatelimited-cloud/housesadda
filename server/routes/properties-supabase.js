import express from 'express';
import { supabase } from '../db-supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to get images for a property
async function getPropertyImages(propertyId) {
  try {
    const { data: images, error } = await supabase
      .from('property_images')
      .select('image_url')
      .eq('property_id', propertyId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching images:', error);
      return [];
    }

    return images.map(img => img.image_url);
  } catch (error) {
    console.error('Error in getPropertyImages:', error);
    return [];
  }
}

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { search, type, city, area, featured, active, transactionType } = req.query;
    
    console.log('📥 GET /properties - Raw query:', req.query);

    // Get location_id and type_id if filters are provided
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

    // Start with base query - select from properties with joins
    let query = supabase
      .from('properties')
      .select(`
        *,
        locations:location_id (
          id,
          name,
          city
        ),
        property_types:type_id (
          id,
          name
        )
      `);

    // Apply filters on properties table
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (typeId) {
      query = query.eq('type_id', typeId);
    }
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    if (featured !== undefined) {
      query = query.eq('is_featured', featured === 'true');
    }
    
    if (active !== undefined) {
      query = query.eq('is_active', active === 'true');
    }
    
    if (transactionType && String(transactionType).trim() !== '' && String(transactionType).trim() !== 'undefined') {
      const filterValue = String(transactionType).trim();
      query = query.eq('transaction_type', filterValue);
      console.log('✅ Filtering by transaction_type:', filterValue);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: properties, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`📦 Found ${properties?.length || 0} properties from database`);

    // Format properties
    const formattedProperties = await Promise.all((properties || []).map(async (prop) => {
      const images = await getPropertyImages(prop.id);
      
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

    res.json(formattedProperties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: prop, error } = await supabase
      .from('properties')
      .select(`
        *,
        locations:location_id (
          id,
          name,
          city
        ),
        property_types:type_id (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error || !prop) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const images = await getPropertyImages(id);

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

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create property (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title, type, city, area, price, bedrooms, bathrooms, sqft,
      description, images, isFeatured, isActive, amenities, highlights,
      brochureUrl, mapUrl, videoUrl, transactionType
    } = req.body;

    console.log('Creating property with data:', { 
      title, type, city, area, price, transactionType,
      bedrooms, bathrooms, sqft 
    });

    // Validate required fields
    if (!title || !type || !area || !price) {
      return res.status(400).json({ error: 'Title, type, area, and price are required' });
    }

    // Get location_id and type_id
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

    if (!location) {
      return res.status(400).json({ error: `Location "${area}" not found. Please add it first.` });
    }
    
    if (!typeRow) {
      return res.status(400).json({ error: `Property type "${type}" not found. Please add it first.` });
    }

    // Insert property
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

    if (propertyError) {
      throw propertyError;
    }

    const propertyId = property.id;
    console.log('Property created with ID:', propertyId);

    // Insert images
    if (images && images.length > 0) {
      const imageRecords = images.map((url, index) => ({
        property_id: propertyId,
        image_url: url,
        display_order: index
      }));

      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(imageRecords);

      if (imagesError) {
        console.error('Error inserting images:', imagesError);
      }
    }

    res.json({ success: true, id: propertyId });
  } catch (error) {
    console.error('Create property error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update property (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, type, city, area, price, bedrooms, bathrooms, sqft,
      description, images, isFeatured, isActive, amenities, highlights,
      brochureUrl, mapUrl, videoUrl, transactionType
    } = req.body;

    // Get location_id and type_id
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

    // Update property
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

    if (updateError) {
      throw updateError;
    }

    // Update images
    if (images !== undefined) {
      // Delete existing images
      await supabase
        .from('property_images')
        .delete()
        .eq('property_id', id);
      
      // Insert new images
      if (images.length > 0) {
        const imageRecords = images.map((url, index) => ({
          property_id: id,
          image_url: url,
          display_order: index
        }));

        const { error: imagesError } = await supabase
          .from('property_images')
          .insert(imageRecords);

        if (imagesError) {
          console.error('Error updating images:', imagesError);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete images first (CASCADE should handle this, but being explicit)
    await supabase
      .from('property_images')
      .delete()
      .eq('property_id', id);
    
    // Delete property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle featured (protected)
router.patch('/:id/featured', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    
    const { error } = await supabase
      .from('properties')
      .update({ is_featured: isFeatured ? true : false })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle active (protected)
router.patch('/:id/active', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const { error } = await supabase
      .from('properties')
      .update({ is_active: isActive ? true : false })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

