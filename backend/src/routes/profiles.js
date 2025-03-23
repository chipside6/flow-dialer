const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const [profiles] = await pool.query('SELECT * FROM profiles');
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: true, message: 'Error fetching profiles' });
  }
});

// Get a single profile by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [profile] = await pool.query('SELECT * FROM profiles WHERE id = ?', [id]);

    if (profile.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found' });
    }

    res.status(200).json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: true, message: 'Error fetching profile' });
  }
});

// Create a new profile
router.post('/', async (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber) {
    return res.status(400).json({ error: true, message: 'All fields are required' });
  }

  try {
    const [result] = await pool.query('INSERT INTO profiles (first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?)', [firstName, lastName, email, phoneNumber]);

    res.status(201).json({ message: 'Profile created successfully', profileId: result.insertId });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: true, message: 'Error creating profile' });
  }
});

// Update an existing profile
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phoneNumber } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber) {
    return res.status(400).json({ error: true, message: 'All fields are required' });
  }

  try {
    const [result] = await pool.query('UPDATE profiles SET first_name = ?, last_name = ?, email = ?, phone_number = ? WHERE id = ?', [firstName, lastName, email, phoneNumber, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: true, message: 'Error updating profile' });
  }
});

// Delete a profile
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM profiles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: true, message: 'Error deleting profile' });
  }
});

module.exports = router;
