import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbAll, dbRun } from '../db-sqlite.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get admin user from database
    const user = await dbGet(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const user = await dbGet(
      'SELECT id, username FROM admin_users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update admin credentials (protected)
router.put('/update-credentials', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const user = await dbGet(
      'SELECT * FROM admin_users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update username if provided
    if (newUsername && newUsername !== user.username) {
      // Check if new username already exists
      const existingUser = await dbGet(
        'SELECT id FROM admin_users WHERE username = ? AND id != ?',
        [newUsername, userId]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      await dbRun(
        'UPDATE admin_users SET username = ? WHERE id = ?',
        [newUsername, userId]
      );
    }

    // Update password if provided
    if (newPassword && newPassword.length >= 6) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await dbRun(
        'UPDATE admin_users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
    } else if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get updated user
    const updatedUser = await dbGet(
      'SELECT id, username FROM admin_users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Credentials updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;

