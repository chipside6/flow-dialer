
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all contact lists
router.get('/', async (req, res) => {
  try {
    const [contactLists] = await pool.query('SELECT * FROM contact_lists');
    res.status(200).json(contactLists);
  } catch (error) {
    console.error('Error fetching contact lists:', error);
    res.status(500).json({ error: true, message: 'Error fetching contact lists' });
  }
});

// Get contact lists for a specific user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [contactLists] = await pool.query('SELECT * FROM contact_lists WHERE user_id = ?', [userId]);
    res.status(200).json(contactLists);
  } catch (error) {
    console.error('Error fetching user contact lists:', error);
    res.status(500).json({ error: true, message: 'Error fetching user contact lists' });
  }
});

// Create a new contact list
router.post('/', async (req, res) => {
  try {
    const { name, description, userId } = req.body;

    if (!name || !description || !userId) {
      return res.status(400).json({ error: true, message: 'Contact list name, description, and user ID are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO contact_lists (name, description, user_id) VALUES (?, ?, ?)', 
      [name, description, userId]
    );

    res.status(201).json({ message: 'Contact list created successfully', contactListId: result.insertId });
  } catch (error) {
    console.error('Error creating contact list:', error);
    res.status(500).json({ error: true, message: 'Error creating contact list' });
  }
});

module.exports = router;
