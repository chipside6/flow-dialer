
const express = require('express');
const { pool } = require('../config/database'); // Assuming the database connection is set up here
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all subscription routes
router.use(authenticateToken);

// Get all subscriptions (admin only)
router.get('/', async (req, res) => {
  try {
    const [subscriptions] = await pool.query('SELECT * FROM subscriptions');
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching subscriptions'
    });
  }
});

// Get subscription for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the requesting user is either getting their own subscription or is an admin
    if (req.userId !== userId) {
      // Check if user is admin (assuming there's a profiles table with is_admin field)
      const [adminCheck] = await pool.query('SELECT is_admin FROM profiles WHERE id = ?', [req.userId]);
      if (!adminCheck.length || !adminCheck[0].is_admin) {
        return res.status(403).json({
          error: true,
          message: 'Unauthorized access to subscription data'
        });
      }
    }
    
    // Get active subscription for user
    const [subscription] = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active"', 
      [userId]
    );

    if (subscription.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'No active subscription found'
      });
    }

    // Check if it's a trial plan and if it's expired
    if (subscription[0].plan_id === 'trial' && subscription[0].current_period_end) {
      const endDate = new Date(subscription[0].current_period_end);
      const now = new Date();
      
      if (now > endDate) {
        // Update subscription status to inactive
        await pool.query(
          'UPDATE subscriptions SET status = "inactive" WHERE id = ?',
          [subscription[0].id]
        );
        
        return res.status(404).json({
          error: true,
          message: 'Trial has expired'
        });
      }
    }

    res.status(200).json(subscription[0]);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching subscription'
    });
  }
});

// Create a new subscription
router.post('/', async (req, res) => {
  try {
    const { user_id, plan_id, plan_name, status, current_period_end } = req.body;

    if (!user_id || !plan_id || !status) {
      return res.status(400).json({
        error: true,
        message: 'User ID, plan ID, and status are required'
      });
    }

    // Check if user already has a subscription
    const [existingSubscription] = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ?', 
      [user_id]
    );

    let result;
    
    if (existingSubscription.length > 0) {
      // Update existing subscription
      [result] = await pool.query(
        'UPDATE subscriptions SET plan_id = ?, plan_name = ?, status = ?, current_period_end = ? WHERE user_id = ?',
        [plan_id, plan_name, status, current_period_end, user_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: true,
          message: 'Subscription not found'
        });
      }
      
      return res.status(200).json({
        message: 'Subscription updated successfully',
        subscriptionId: existingSubscription[0].id
      });
    } else {
      // Insert new subscription
      [result] = await pool.query(
        'INSERT INTO subscriptions (user_id, plan_id, plan_name, status, current_period_end) VALUES (?, ?, ?, ?, ?)',
        [user_id, plan_id, plan_name || '', status, current_period_end]
      );
      
      return res.status(201).json({
        message: 'Subscription created successfully',
        subscriptionId: result.insertId
      });
    }
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating/updating subscription'
    });
  }
});

// Cancel a subscription
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Update the subscription status to 'canceled' instead of deleting
    const [result] = await pool.query(
      'UPDATE subscriptions SET status = "canceled" WHERE id = ?', 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      error: true,
      message: 'Error canceling subscription'
    });
  }
});

module.exports = router;
