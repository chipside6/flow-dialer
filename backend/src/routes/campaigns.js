
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

module.exports = router;
