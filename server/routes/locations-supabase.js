import express from 'express';
import { supabase } from '../db-supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = supabase.from('locations').select('*');

    if (city) {
      query = query.eq('city', city);
    }

    query = query.order('city', { ascending: true }).order('name', { ascending: true });

    const { data: locations, error } = await query;

    if (error) {
      throw error;
    }

    res.json(locations || []);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create location (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: 'Name and city are required' });
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({ name, city })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Location already exists' });
      }
      throw error;
    }

    res.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update location (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city } = req.body;

    const { error } = await supabase
      .from('locations')
      .update({ name, city })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete location (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

