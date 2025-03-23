
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

// Create a new contact list
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: true, message: 'Contact list name and description are required' });
    }

    const [result] = await pool.query('INSERT INTO contact_lists (name, description) VALUES (?, ?)', [name, description]);

    res.status(201).json({ message: 'Contact list created successfully', contactListId: result.insertId });
  } catch (error) {
    console.error('Error creating contact list:', error);
    res.status(500).json({ error: true, message: 'Error creating contact list' });
  }
});

module.exports = router;
