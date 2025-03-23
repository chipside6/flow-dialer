
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get subscriptions
router.get('/', async (req, res) => {
  try {
    const [subscriptions] = await pool.query('SELECT * FROM subscriptions');
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: true, message: 'Error fetching subscriptions' });
  }
});

// Get a user's subscription
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [subscriptions] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ error: true, message: 'No subscription found for this user' });
    }
    
    res.status(200).json(subscriptions[0]);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: true, message: 'Error fetching user subscription' });
  }
});

// Create or update a subscription
router.post('/', async (req, res) => {
  const { userId, planId, planName, status, currentPeriodEnd } = req.body;
  
  if (!userId || !planId || !planName || !status) {
    return res.status(400).json({ error: true, message: 'Required subscription details missing' });
  }
  
  try {
    // Check if user already has a subscription
    const [existingSubscriptions] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    
    if (existingSubscriptions.length > 0) {
      // Update existing subscription
      await pool.query(
        'UPDATE subscriptions SET plan_id = ?, plan_name = ?, status = ?, current_period_end = ?, updated_at = NOW() WHERE user_id = ?',
        [planId, planName, status, currentPeriodEnd, userId]
      );
      
      res.status(200).json({ message: 'Subscription updated successfully' });
    } else {
      // Create new subscription
      await pool.query(
        'INSERT INTO subscriptions (user_id, plan_id, plan_name, status, current_period_end) VALUES (?, ?, ?, ?, ?)',
        [userId, planId, planName, status, currentPeriodEnd]
      );
      
      res.status(201).json({ message: 'Subscription created successfully' });
    }
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({ error: true, message: 'Error processing subscription' });
  }
});

module.exports = router;
