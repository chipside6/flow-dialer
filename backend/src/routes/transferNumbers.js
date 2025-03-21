
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all transfer numbers for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: true, 
        message: 'User ID is required' 
      });
    }
    
    // Check if requested user matches authenticated user
    if (req.userId !== userId) {
      // Check if the user is an admin
      const [adminCheck] = await pool.query(
        'SELECT is_admin FROM profiles WHERE id = ?', 
        [req.userId]
      );
      
      if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
        return res.status(403).json({ 
          error: true, 
          message: 'Access denied: You can only view your own transfer numbers' 
        });
      }
    }
    
    // Get transfer numbers for user
    const [transferNumbers] = await pool.query(
      'SELECT * FROM transfer_numbers WHERE user_id = ? ORDER BY created_at DESC', 
      [userId]
    );
    
    res.status(200).json(transferNumbers);
  } catch (error) {
    console.error('Error fetching transfer numbers:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching transfer numbers' 
    });
  }
});

// Create a new transfer number
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, name, phone_number, description, call_count } = req.body;
    
    if (!user_id || !name || !phone_number) {
      return res.status(400).json({ 
        error: true, 
        message: 'User ID, name, and phone number are required' 
      });
    }
    
    // Check if user_id matches authenticated user
    if (req.userId !== user_id) {
      return res.status(403).json({ 
        error: true, 
        message: 'Access denied: You can only create transfer numbers for yourself' 
      });
    }
    
    // Create transfer number ID
    const id = uuidv4();
    
    // Insert transfer number
    await pool.query(
      'INSERT INTO transfer_numbers (id, user_id, name, phone_number, description, call_count) VALUES (?, ?, ?, ?, ?, ?)', 
      [id, user_id, name, phone_number, description || null, call_count || 0]
    );
    
    const [newTransferNumber] = await pool.query(
      'SELECT * FROM transfer_numbers WHERE id = ?', 
      [id]
    );
    
    res.status(201).json(newTransferNumber[0]);
  } catch (error) {
    console.error('Error creating transfer number:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error creating transfer number' 
    });
  }
});

// Delete a transfer number
router.delete('/:transferNumberId', authenticateToken, async (req, res) => {
  try {
    const { transferNumberId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: true, 
        message: 'User ID is required' 
      });
    }
    
    // Check if user_id matches authenticated user
    if (req.userId !== userId) {
      return res.status(403).json({ 
        error: true, 
        message: 'Access denied: You can only delete your own transfer numbers' 
      });
    }
    
    // Check if transfer number exists and belongs to user
    const [transferNumbers] = await pool.query(
      'SELECT * FROM transfer_numbers WHERE id = ? AND user_id = ?', 
      [transferNumberId, userId]
    );
    
    if (transferNumbers.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Transfer number not found or does not belong to you' 
      });
    }
    
    // Delete transfer number
    await pool.query(
      'DELETE FROM transfer_numbers WHERE id = ?', 
      [transferNumberId]
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting transfer number:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error deleting transfer number' 
    });
  }
});

module.exports = router;
