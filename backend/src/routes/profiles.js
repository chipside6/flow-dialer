
const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get a user's profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access their own profile unless they're an admin
    if (req.userId !== userId) {
      // Check if the requester is an admin
      const [adminCheck] = await pool.query(
        'SELECT is_admin FROM profiles WHERE id = ?', 
        [req.userId]
      );
      
      if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
        return res.status(403).json({ 
          error: true, 
          message: 'Access denied: You can only view your own profile' 
        });
      }
    }
    
    // Get profile from database
    const [profiles] = await pool.query(
      'SELECT p.*, u.email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.id = ?', 
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Profile not found' 
      });
    }
    
    const profile = profiles[0];
    
    res.status(200).json({
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      is_admin: !!profile.is_admin,
      is_affiliate: !!profile.is_affiliate,
      email: profile.email,
      company_name: profile.company_name,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching user profile' 
    });
  }
});

// Update a user's profile
router.patch('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Users can only update their own profile
    if (req.userId !== userId) {
      return res.status(403).json({ 
        error: true, 
        message: 'Access denied: You can only update your own profile' 
      });
    }
    
    // Disallow updating certain fields
    const allowedUpdates = ['full_name', 'avatar_url', 'company_name'];
    const updateFields = Object.keys(updates).filter(key => allowedUpdates.includes(key));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'No valid fields to update' 
      });
    }
    
    // Build update query
    let query = 'UPDATE profiles SET ';
    const values = [];
    
    updateFields.forEach((field, index) => {
      query += `${field} = ?`;
      values.push(updates[field]);
      
      if (index < updateFields.length - 1) {
        query += ', ';
      }
    });
    
    query += ', updated_at = NOW() WHERE id = ?';
    values.push(userId);
    
    // Update profile
    await pool.query(query, values);
    
    res.status(200).json({ 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error updating user profile' 
    });
  }
});

// Set a user as an affiliate
router.post('/:userId/affiliate', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM profiles WHERE id = ?', 
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'User not found' 
      });
    }
    
    // Update affiliate status
    await pool.query(
      'UPDATE profiles SET is_affiliate = TRUE, updated_at = NOW() WHERE id = ?', 
      [userId]
    );
    
    res.status(200).json({ 
      message: 'User has been set as an affiliate' 
    });
  } catch (error) {
    console.error('Error setting affiliate status:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error setting affiliate status' 
    });
  }
});

module.exports = router;
