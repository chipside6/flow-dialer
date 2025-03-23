
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// CORS headers middleware
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Get all SIP providers
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    
    if (!userId) {
      return res.status(400).json({ error: true, message: 'User ID is required' });
    }
    
    const [sipProviders] = await pool.query('SELECT * FROM sip_providers WHERE user_id = ?', [userId]);
    res.status(200).json(sipProviders);
  } catch (error) {
    console.error('Error fetching SIP providers:', error);
    res.status(500).json({ error: true, message: 'Error fetching SIP providers' });
  }
});

// Create a new SIP provider
router.post('/', async (req, res) => {
  try {
    const { name, host, port, username, password, user_id } = req.body;

    if (!name || !host || !port || !username || !password || !user_id) {
      return res.status(400).json({ error: true, message: 'All SIP provider details are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO sip_providers (name, host, port, username, password, user_id) VALUES (?, ?, ?, ?, ?, ?)', 
      [name, host, port, username, password, user_id]
    );

    res.status(201).json({ message: 'SIP provider created successfully', sipProviderId: result.insertId });
  } catch (error) {
    console.error('Error creating SIP provider:', error);
    res.status(500).json({ error: true, message: 'Error creating SIP provider' });
  }
});

// Update existing SIP provider
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, host, port, username, password, user_id } = req.body;

    if (!name || !host || !port || !username || !password || !user_id) {
      return res.status(400).json({ error: true, message: 'All SIP provider details are required' });
    }

    const [result] = await pool.query(
      'UPDATE sip_providers SET name = ?, host = ?, port = ?, username = ?, password = ? WHERE id = ? AND user_id = ?',
      [name, host, port, username, password, id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'SIP provider not found or not authorized' });
    }

    res.status(200).json({ message: 'SIP provider updated successfully' });
  } catch (error) {
    console.error('Error updating SIP provider:', error);
    res.status(500).json({ error: true, message: 'Error updating SIP provider' });
  }
});

// Delete SIP provider
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: true, message: 'User ID is required' });
    }

    const [result] = await pool.query('DELETE FROM sip_providers WHERE id = ? AND user_id = ?', [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'SIP provider not found or not authorized' });
    }

    res.status(200).json({ message: 'SIP provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting SIP provider:', error);
    res.status(500).json({ error: true, message: 'Error deleting SIP provider' });
  }
});

// Toggle provider status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { active, user_id } = req.body;

    if (active === undefined || !user_id) {
      return res.status(400).json({ error: true, message: 'Status and user ID are required' });
    }

    const [result] = await pool.query(
      'UPDATE sip_providers SET active = ? WHERE id = ? AND user_id = ?',
      [active, id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'SIP provider not found or not authorized' });
    }

    res.status(200).json({ message: 'SIP provider status updated successfully' });
  } catch (error) {
    console.error('Error updating SIP provider status:', error);
    res.status(500).json({ error: true, message: 'Error updating SIP provider status' });
  }
});

module.exports = router;
