import express from 'express';
import { pool } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { search, type, city, area, featured, active } = req.query;
    
    let query = `
      SELECT p.*, 
             l.name as location_name, 
             pt.name as type_name,
             GROUP_CONCAT(pi.image_url) as images
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN property_types pt ON p.type_id = pt.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
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

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    const [properties] = await pool.execute(query, params);

    // Format properties
    const formattedProperties = properties.map(prop => ({
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
      image: prop.images ? prop.images.split(',')[0] : null,
      images: prop.images ? prop.images.split(',') : [],
      isFeatured: prop.is_featured === 1,
      isActive: prop.is_active === 1,
      amenities: prop.amenities ? JSON.parse(prop.amenities) : [],
      highlights: prop.highlights ? JSON.parse(prop.highlights) : [],
      brochureUrl: prop.brochure_url,
      mapUrl: prop.map_url,
      createdAt: prop.created_at
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

    const [properties] = await pool.execute(
      `SELECT p.*, 
              l.name as location_name, 
              pt.name as type_name,
              GROUP_CONCAT(pi.image_url) as images
       FROM properties p
       LEFT JOIN locations l ON p.location_id = l.id
       LEFT JOIN property_types pt ON p.type_id = pt.id
       LEFT JOIN property_images pi ON p.id = pi.property_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const prop = properties[0];
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
      image: prop.images ? prop.images.split(',')[0] : null,
      images: prop.images ? prop.images.split(',') : [],
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
      title,
      type,
      city,
      area,
      price,
      bedrooms,
      bathrooms,
      sqft,
      description,
      images,
      isFeatured,
      isActive,
      amenities,
      highlights,
      brochureUrl,
      mapUrl
    } = req.body;

    // Get location_id and type_id
    const [locations] = await pool.execute(
      'SELECT id FROM locations WHERE name = ? AND city = ?',
      [area, city || 'Hyderabad']
    );
    
    const [types] = await pool.execute(
      'SELECT id FROM property_types WHERE name = ?',
      [type]
    );

    if (locations.length === 0 || types.length === 0) {
      return res.status(400).json({ error: 'Invalid location or type' });
    }

    const locationId = locations[0].id;
    const typeId = types[0].id;

    // Insert property
    const [result] = await pool.execute(
      `INSERT INTO properties 
       (title, location_id, type_id, city, price, bedrooms, bathrooms, sqft, 
        description, is_featured, is_active, amenities, highlights, brochure_url, map_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        locationId,
        typeId,
        city || 'Hyderabad',
        price,
        bedrooms || 0,
        bathrooms || 0,
        sqft || 0,
        description || '',
        isFeatured ? 1 : 0,
        isActive ? 1 : 0,
        JSON.stringify(amenities || []),
        JSON.stringify(highlights || []),
        brochureUrl || '',
        mapUrl || ''
      ]
    );

    const propertyId = result.insertId;

    // Insert images
    if (images && images.length > 0) {
      const imageValues = images.map((img, index) => [propertyId, img, index]);
      await pool.query(
        'INSERT INTO property_images (property_id, image_url, display_order) VALUES ?',
        [imageValues]
      );
    }

    res.json({ success: true, id: propertyId });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update property (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      city,
      area,
      price,
      bedrooms,
      bathrooms,
      sqft,
      description,
      images,
      isFeatured,
      isActive,
      amenities,
      highlights,
      brochureUrl,
      mapUrl
    } = req.body;

    // Get location_id and type_id
    const [locations] = await pool.execute(
      'SELECT id FROM locations WHERE name = ? AND city = ?',
      [area, city || 'Hyderabad']
    );
    
    const [types] = await pool.execute(
      'SELECT id FROM property_types WHERE name = ?',
      [type]
    );

    if (locations.length === 0 || types.length === 0) {
      return res.status(400).json({ error: 'Invalid location or type' });
    }

    const locationId = locations[0].id;
    const typeId = types[0].id;

    // Update property
    await pool.execute(
      `UPDATE properties SET
       title = ?, location_id = ?, type_id = ?, city = ?, price = ?,
       bedrooms = ?, bathrooms = ?, sqft = ?, description = ?,
       is_featured = ?, is_active = ?, amenities = ?, highlights = ?,
       brochure_url = ?, map_url = ?
       WHERE id = ?`,
      [
        title,
        locationId,
        typeId,
        city || 'Hyderabad',
        price,
        bedrooms || 0,
        bathrooms || 0,
        sqft || 0,
        description || '',
        isFeatured ? 1 : 0,
        isActive ? 1 : 0,
        JSON.stringify(amenities || []),
        JSON.stringify(highlights || []),
        brochureUrl || '',
        mapUrl || '',
        id
      ]
    );

    // Update images
    if (images) {
      // Delete existing images
      await pool.execute('DELETE FROM property_images WHERE property_id = ?', [id]);
      
      // Insert new images
      if (images.length > 0) {
        const imageValues = images.map((img, index) => [id, img, index]);
        await pool.query(
          'INSERT INTO property_images (property_id, image_url, display_order) VALUES ?',
          [imageValues]
        );
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

    // Delete images first
    await pool.execute('DELETE FROM property_images WHERE property_id = ?', [id]);
    
    // Delete property
    await pool.execute('DELETE FROM properties WHERE id = ?', [id]);

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

    await pool.execute(
      'UPDATE properties SET is_featured = ? WHERE id = ?',
      [isFeatured ? 1 : 0, id]
    );

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

    await pool.execute(
      'UPDATE properties SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

