
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, metadata } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: true, message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate a unique ID for the user
    const userId = Date.now().toString();
    
    // Insert user
    await pool.query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [userId, email, passwordHash]);

    // Create a profile record too
    const fullName = metadata?.full_name || null;
    await pool.query('INSERT INTO profiles (id, email, full_name) VALUES (?, ?, ?)', [userId, email, fullName]);

    // Create JWT token for immediate login after signup
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    
    // Calculate expiry date for the session
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days in seconds

    // Return user session just like login does
    res.status(201).json({
      message: 'User created successfully',
      session: {
        user: {
          id: userId,
          email,
        },
        expires_at: expiresAt,
        token
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: true, message: 'Error creating user account' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    // Get user from database
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: true, message: 'Invalid login credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: true, message: 'Invalid login credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    // Calculate expiry date for the session
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days in seconds

    // Return user session matching the expected format in authService.ts
    res.status(200).json({
      session: {
        user: {
          id: user.id,
          email: user.email,
        },
        expires_at: expiresAt,
        token
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: true, message: 'Error during login process' });
  }
});

// Add a logout endpoint
router.post('/logout', (req, res) => {
  // In a token-based system, backend logout is minimal
  // The client should handle removing the token
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
