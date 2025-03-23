
const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all contact lists for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;  // Get user ID from the authenticated user
    const [contactLists] = await pool.query('SELECT * FROM contact_lists WHERE user_id = ?', [userId]);
    res.status(200).json(contactLists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch contact lists' });
  }
});

// Create a new contact list
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;  // Get user ID from the authenticated user
    const { name, description } = req.body;  // Contact list data from request body
    const listId = uuidv4();  // Generate a unique list ID

    // Insert new contact list into the database
    await pool.query('INSERT INTO contact_lists (id, user_id, name, description) VALUES (?, ?, ?, ?)', 
      [listId, userId, name, description]);

    res.status(201).json({ message: 'Contact list created successfully', listId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create contact list' });
  }
});

module.exports = router;
