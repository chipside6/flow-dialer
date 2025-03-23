
const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all subscriptions for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;  // Get user ID from the authenticated user
    const [subscriptions] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// Create or update a subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;  // Get user ID from the authenticated user
    const { plan, startDate, endDate } = req.body;  // Subscription data from request body

    // Check if the user already has an active subscription
    const [existingSubscription] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ? AND end_date > NOW()', [userId]);

    if (existingSubscription.length > 0) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    // Insert new subscription or update existing one
    const subscriptionId = uuidv4();  // Generate a unique subscription ID
    await pool.query('INSERT INTO subscriptions (id, user_id, plan, start_date, end_date) VALUES (?, ?, ?, ?, ?)', 
      [subscriptionId, userId, plan, startDate, endDate]);

    res.status(201).json({ message: 'Subscription created successfully', subscriptionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create or update subscription' });
  }
});

module.exports = router;
