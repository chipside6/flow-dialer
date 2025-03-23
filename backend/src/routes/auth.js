
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, metadata } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user ID
    const userId = uuidv4();

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert user
      await connection.query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [userId, email, passwordHash]);

      // Insert profile
      await connection.query('INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)', [userId, userId, metadata?.full_name || null]);

      await connection.commit();
      res.status(201).json({
        message: 'User created successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating user account'
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    // Get user from database
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid login credentials'
      });
    }

    const user = users[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid login credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    // Get current date plus expiration time
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const daysToAdd = parseInt(expiresIn.replace('d', ''), 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);

    // Update last login timestamp
    await pool.query('UPDATE users SET last_sign_in_at = NOW() WHERE id = ?', [user.id]);

    // Return user session
    res.status(200).json({
      session: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        },
        expires_at: Math.floor(expiresAt.getTime() / 1000)
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      error: true,
      message: 'Error during login process'
    });
  }
});

// User logout
router.post('/logout', async (req, res) => {
  // In a stateless JWT setup, the client is responsible for removing the token
  // The server doesn't need to do anything specific for logout
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
