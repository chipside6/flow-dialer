
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const [campaigns] = await pool.query('SELECT * FROM campaigns');
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: true, message: 'Error fetching campaigns' });
  }
});

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    if (!name || !description || !status) {
      return res.status(400).json({ error: true, message: 'Campaign name, description, and status are required' });
    }

    const [result] = await pool.query('INSERT INTO campaigns (name, description, status) VALUES (?, ?, ?)', [name, description, status]);

    res.status(201).json({ message: 'Campaign created successfully', campaignId: result.insertId });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: true, message: 'Error creating campaign' });
  }
});

// Get campaign call count for a user
router.get('/call-count/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [result] = await pool.query(
      'SELECT SUM(total_calls) as totalCalls FROM campaigns WHERE user_id = ?', 
      [userId]
    );
    
    res.status(200).json({ totalCalls: result[0].totalCalls || 0 });
  } catch (error) {
    console.error('Error fetching campaign call count:', error);
    res.status(500).json({ error: true, message: 'Error fetching campaign call count' });
  }
});

module.exports = router;
