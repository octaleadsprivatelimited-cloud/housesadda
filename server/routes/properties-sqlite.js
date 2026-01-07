import express from 'express';
import { dbGet, dbAll, dbRun } from '../db-sqlite.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to get images for a property
async function getPropertyImages(propertyId) {
  const images = await dbAll(
    'SELECT image_url FROM property_images WHERE property_id = ? ORDER BY display_order',
    [propertyId]
  );
  return images.map(img => img.image_url);
}

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { search, type, city, area, featured, active } = req.query;
    
    let query = `
      SELECT p.*, l.name as location_name, pt.name as type_name
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN property_types pt ON p.type_id = pt.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type) {
      query += ' AND pt.name = ?';
      params.push(type);
    }
    if (city) {
      query += ' AND l.city = ?';
      params.push(city);
    }
    if (area) {
      query += ' AND l.name = ?';
      params.push(area);
    }
    if (featured !== undefined) {
      query += ' AND p.is_featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }
    if (active !== undefined) {
      query += ' AND p.is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY p.created_at DESC';

    const properties = await dbAll(query, params);

    // Get images for each property
    const formattedProperties = await Promise.all(properties.map(async (prop) => {
      const images = await getPropertyImages(prop.id);
      return {
        id: prop.id,
        title: prop.title,
        type: prop.type_name,
        area: prop.location_name,
        city: prop.city || 'Hyderabad',
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: prop.sqft,
        description: prop.description,
        image: images[0] || null,
        images: images,
        isFeatured: prop.is_featured === 1,
        isActive: prop.is_active === 1,
        amenities: prop.amenities ? JSON.parse(prop.amenities) : [],
        highlights: prop.highlights ? JSON.parse(prop.highlights) : [],
        brochureUrl: prop.brochure_url,
        mapUrl: prop.map_url,
        createdAt: prop.created_at
      };
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const prop = await dbGet(
      `SELECT p.*, l.name as location_name, pt.name as type_name
       FROM properties p
       LEFT JOIN locations l ON p.location_id = l.id
       LEFT JOIN property_types pt ON p.type_id = pt.id
       WHERE p.id = ?`,
      [id]
    );

    if (!prop) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const images = await getPropertyImages(id);

    const property = {
      id: prop.id,
      title: prop.title,
      type: prop.type_name,
      area: prop.location_name,
      city: prop.city || 'Hyderabad',
      price: prop.price,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      sqft: prop.sqft,
      description: prop.description,
      image: images[0] || null,
      images: images,
      isFeatured: prop.is_featured === 1,
      isActive: prop.is_active === 1,
      amenities: prop.amenities ? JSON.parse(prop.amenities) : [],
      highlights: prop.highlights ? JSON.parse(prop.highlights) : [],
      brochureUrl: prop.brochure_url,
      mapUrl: prop.map_url,
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
      brochureUrl, mapUrl
    } = req.body;

    console.log('Creating property with data:', { title, type, city, area, price });

    // Validate required fields
    if (!title || !type || !area || !price) {
      return res.status(400).json({ error: 'Title, type, area, and price are required' });
    }

    // Get location_id and type_id
    const location = await dbGet(
      'SELECT id FROM locations WHERE name = ? AND city = ?',
      [area, city || 'Hyderabad']
    );
    
    const typeRow = await dbGet(
      'SELECT id FROM property_types WHERE name = ?',
      [type]
    );

    if (!location) {
      return res.status(400).json({ error: `Location "${area}" not found. Please add it first.` });
    }
    
    if (!typeRow) {
      return res.status(400).json({ error: `Property type "${type}" not found. Please add it first.` });
    }

    // Insert property
    const result = await dbRun(
      `INSERT INTO properties 
       (title, location_id, type_id, city, price, bedrooms, bathrooms, sqft, 
        description, is_featured, is_active, amenities, highlights, brochure_url, map_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, location.id, typeRow.id, city || 'Hyderabad', parseFloat(price) || 0,
        parseInt(bedrooms) || 0, parseInt(bathrooms) || 0, parseInt(sqft) || 0, description || '',
        isFeatured ? 1 : 0, isActive !== false ? 1 : 0,
        JSON.stringify(amenities || []), JSON.stringify(highlights || []),
        brochureUrl || '', mapUrl || ''
      ]
    );

    const propertyId = result.lastID;
    console.log('Property created with ID:', propertyId);

    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await dbRun(
          'INSERT INTO property_images (property_id, image_url, display_order) VALUES (?, ?, ?)',
          [propertyId, images[i], i]
        );
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
      brochureUrl, mapUrl
    } = req.body;

    // Get location_id and type_id
    const location = await dbGet(
      'SELECT id FROM locations WHERE name = ? AND city = ?',
      [area, city || 'Hyderabad']
    );
    
    const typeRow = await dbGet(
      'SELECT id FROM property_types WHERE name = ?',
      [type]
    );

    if (!location || !typeRow) {
      return res.status(400).json({ error: 'Invalid location or type' });
    }

    // Update property
    await dbRun(
      `UPDATE properties SET
       title = ?, location_id = ?, type_id = ?, city = ?, price = ?,
       bedrooms = ?, bathrooms = ?, sqft = ?, description = ?,
       is_featured = ?, is_active = ?, amenities = ?, highlights = ?,
       brochure_url = ?, map_url = ?
       WHERE id = ?`,
      [
        title, location.id, typeRow.id, city || 'Hyderabad', price,
        bedrooms || 0, bathrooms || 0, sqft || 0, description || '',
        isFeatured ? 1 : 0, isActive ? 1 : 0,
        JSON.stringify(amenities || []), JSON.stringify(highlights || []),
        brochureUrl || '', mapUrl || '', id
      ]
    );

    // Update images
    if (images !== undefined) {
      await dbRun('DELETE FROM property_images WHERE property_id = ?', [id]);
      
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await dbRun(
            'INSERT INTO property_images (property_id, image_url, display_order) VALUES (?, ?, ?)',
            [id, images[i], i]
          );
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
    await dbRun('DELETE FROM property_images WHERE property_id = ?', [id]);
    await dbRun('DELETE FROM properties WHERE id = ?', [id]);
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
    await dbRun('UPDATE properties SET is_featured = ? WHERE id = ?', [isFeatured ? 1 : 0, id]);
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
    await dbRun('UPDATE properties SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

