const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all SIP providers
router.get('/', async (req, res) => {
  try {
    const [sipProviders] = await pool.query('SELECT * FROM sip_providers');
    res.status(200).json(sipProviders);
  } catch (error) {
    console.error('Error fetching SIP providers:', error);
    res.status(500).json({ error: true, message: 'Error fetching SIP providers' });
  }
});

// Create a new SIP provider
router.post('/', async (req, res) => {
  try {
    const { name, host, port, username, password } = req.body;

    if (!name || !host || !port || !username || !password) {
      return res.status(400).json({ error: true, message: 'All SIP provider details are required' });
    }

    const [result] = await pool.query('INSERT INTO sip_providers (name, host, port, username, password) VALUES (?, ?, ?, ?, ?)', [name, host, port, username, password]);

    res.status(201).json({ message: 'SIP provider created successfully', sipProviderId: result.insertId });
  } catch (error) {
    console.error('Error creating SIP provider:', error);
    res.status(500).json({ error: true, message: 'Error creating SIP provider' });
  }
});

module.exports = router;
