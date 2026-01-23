import express from 'express';
import { dbGet, dbAll, dbRun } from '../db-sqlite.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all property types
router.get('/', async (req, res) => {
  try {
    const types = await dbAll('SELECT * FROM property_types ORDER BY name');
    res.json(types);
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

    const result = await dbRun(
      'INSERT INTO property_types (name) VALUES (?)',
      [name]
    );

    res.json({ success: true, id: result.lastID });
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

    await dbRun(
      'UPDATE property_types SET name = ? WHERE id = ?',
      [name, id]
    );

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
    await dbRun('DELETE FROM property_types WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

