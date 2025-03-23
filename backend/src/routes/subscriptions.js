
const express = require('express');
const { pool } = require('../config/database'); // Assuming the database connection is set up here

const router = express.Router();

// Get all subscriptions
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

// Get subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [subscription] = await pool.query('SELECT * FROM subscriptions WHERE id = ?', [id]);

    if (subscription.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Subscription not found'
      });
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
    const { user_id, plan_id, status, start_date, end_date } = req.body;

    if (!user_id || !plan_id || !status || !start_date || !end_date) {
      return res.status(400).json({
        error: true,
        message: 'All fields are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [user_id, plan_id, status, start_date, end_date]
    );

    res.status(201).json({
      message: 'Subscription created successfully',
      subscriptionId: result.insertId
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating subscription'
    });
  }
});

// Update a subscription
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, plan_id, status, start_date, end_date } = req.body;

    if (!user_id || !plan_id || !status || !start_date || !end_date) {
      return res.status(400).json({
        error: true,
        message: 'All fields are required'
      });
    }

    const [result] = await pool.query(
      'UPDATE subscriptions SET user_id = ?, plan_id = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?',
      [user_id, plan_id, status, start_date, end_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating subscription'
    });
  }
});

// Delete a subscription
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM subscriptions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({
      error: true,
      message: 'Error deleting subscription'
    });
  }
});

module.exports = router;

