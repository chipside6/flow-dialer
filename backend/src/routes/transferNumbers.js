
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all transfer numbers
router.get('/', async (req, res) => {
  try {
    const [transferNumbers] = await pool.query('SELECT * FROM transfer_numbers');
    res.status(200).json(transferNumbers);
  } catch (error) {
    console.error('Error fetching transfer numbers:', error);
    res.status(500).json({ error: true, message: 'Error fetching transfer numbers' });
  }
});

// Create a new transfer number
router.post('/', async (req, res) => {
  try {
    const { number, providerId, status } = req.body;

    if (!number || !providerId || !status) {
      return res.status(400).json({ error: true, message: 'Number, provider ID, and status are required' });
    }

    const [result] = await pool.query('INSERT INTO transfer_numbers (number, provider_id, status) VALUES (?, ?, ?)', [number, providerId, status]);

    res.status(201).json({ message: 'Transfer number created successfully', transferNumberId: result.insertId });
  } catch (error) {
    console.error('Error creating transfer number:', error);
    res.status(500).json({ error: true, message: 'Error creating transfer number' });
  }
});

module.exports = router;
