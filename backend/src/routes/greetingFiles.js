
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all greeting files
router.get('/', async (req, res) => {
  try {
    const [greetingFiles] = await pool.query('SELECT * FROM greeting_files');
    res.status(200).json(greetingFiles);
  } catch (error) {
    console.error('Error fetching greeting files:', error);
    res.status(500).json({ error: true, message: 'Error fetching greeting files' });
  }
});

// Create a new greeting file
router.post('/', async (req, res) => {
  try {
    const { name, filePath } = req.body;

    if (!name || !filePath) {
      return res.status(400).json({ error: true, message: 'Name and file path are required' });
    }

    const [result] = await pool.query('INSERT INTO greeting_files (name, file_path) VALUES (?, ?)', [name, filePath]);

    res.status(201).json({ message: 'Greeting file created successfully', greetingFileId: result.insertId });
  } catch (error) {
    console.error('Error creating greeting file:', error);
    res.status(500).json({ error: true, message: 'Error creating greeting file' });
  }
});

module.exports = router;
