
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all campaigns for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;  // Get user ID from the authenticated user
    const [campaigns] = await pool.query('SELECT * FROM campaigns WHERE user_id = ?', [userId]);
    res.status(200).json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

// Create a new campaign
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;  // Get user ID from the authenticated user
    const { name, description } = req.body;  // Campaign data from request body
    const campaignId = uuidv4();  // Generate a unique campaign ID

    // Insert new campaign into the database
    await pool.query('INSERT INTO campaigns (id, user_id, name, description) VALUES (?, ?, ?, ?)', 
      [campaignId, userId, name, description]);

    res.status(201).json({ message: 'Campaign created successfully', campaignId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
});

// Get total call count for a user
router.get('/call-count/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const [result] = await pool.query('SELECT COUNT(*) AS callCount FROM calls WHERE user_id = ?', [userId]);
    const callCount = result[0].callCount;
    res.status(200).json({ callCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch call count' });
  }
});

module.exports = router;
