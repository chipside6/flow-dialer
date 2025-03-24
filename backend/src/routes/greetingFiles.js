
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
    const { name, filePath, url, userId } = req.body;

    if (!name || !filePath || !url || !userId) {
      return res.status(400).json({ error: true, message: 'Name, file path, URL and user ID are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO greeting_files (filename, file_path, url, user_id) VALUES (?, ?, ?, ?)', 
      [name, filePath, url, userId]
    );

    res.status(201).json({ 
      message: 'Greeting file created successfully', 
      greetingFileId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating greeting file:', error);
    res.status(500).json({ error: true, message: 'Error creating greeting file' });
  }
});

// Delete a greeting file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id || !userId) {
      return res.status(400).json({ error: true, message: 'File ID and user ID are required' });
    }

    // First get the file path to be able to delete the file from storage
    const [files] = await pool.query(
      'SELECT file_path FROM greeting_files WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (files.length === 0) {
      return res.status(404).json({ error: true, message: 'Greeting file not found' });
    }

    // Now delete the record
    const [result] = await pool.query(
      'DELETE FROM greeting_files WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Greeting file not found or not authorized' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Greeting file deleted successfully',
      filePath: files[0].file_path
    });
  } catch (error) {
    console.error('Error deleting greeting file:', error);
    res.status(500).json({ error: true, message: 'Error deleting greeting file' });
  }
});

module.exports = router;
