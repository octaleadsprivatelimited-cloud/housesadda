import express from 'express';
import { dbGet, dbAll, dbRun } from '../db-sqlite.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = 'SELECT * FROM locations';
    const params = [];

    if (city) {
      query += ' WHERE city = ?';
      params.push(city);
    }

    query += ' ORDER BY city, name';

    const locations = await dbAll(query, params);
    res.json(locations);
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

    const result = await dbRun(
      'INSERT INTO locations (name, city) VALUES (?, ?)',
      [name, city]
    );

    res.json({ success: true, id: result.lastID });
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

    await dbRun(
      'UPDATE locations SET name = ?, city = ? WHERE id = ?',
      [name, city, id]
    );

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
    await dbRun('DELETE FROM locations WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

