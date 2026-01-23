import express from 'express';
import { supabase } from '../db-supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all property types
router.get('/', async (req, res) => {
  try {
    const { data: types, error } = await supabase
      .from('property_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    res.json(types || []);
  } catch (error) {
    console.error('Get types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create property type (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data, error } = await supabase
      .from('property_types')
      .insert({ name })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Property type already exists' });
      }
      throw error;
    }

    res.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Create type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update property type (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const { error } = await supabase
      .from('property_types')
      .update({ name })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property type (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('property_types')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

