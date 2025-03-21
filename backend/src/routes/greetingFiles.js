
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Set up multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

const router = express.Router();

// Get all greeting files for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: true, 
        message: 'User ID is required' 
      });
    }
    
    // Verify access permission
    if (req.userId !== userId) {
      // Check if admin
      const [adminCheck] = await pool.query(
        'SELECT is_admin FROM profiles WHERE id = ?', 
        [req.userId]
      );
      
      if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
        return res.status(403).json({ 
          error: true, 
          message: 'Access denied: You can only view your own greeting files' 
        });
      }
    }
    
    // Get greeting files
    const [files] = await pool.query(
      'SELECT * FROM greeting_files WHERE user_id = ? ORDER BY created_at DESC', 
      [userId]
    );
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching greeting files:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching greeting files' 
    });
  }
});

// Upload a new greeting file
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: true, 
        message: 'No file uploaded' 
      });
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        error: true, 
        message: 'User ID is required' 
      });
    }
    
    // Verify access permission
    if (req.userId !== userId) {
      return res.status(403).json({ 
        error: true, 
        message: 'Access denied: You can only upload files for yourself' 
      });
    }
    
    const fileId = uuidv4();
    const filename = req.file.originalname;
    const url = `/uploads/${req.file.filename}`;
    
    // Insert greeting file record
    await pool.query(
      'INSERT INTO greeting_files (id, user_id, filename, url) VALUES (?, ?, ?, ?)', 
      [fileId, userId, filename, url]
    );
    
    const [newFile] = await pool.query(
      'SELECT * FROM greeting_files WHERE id = ?', 
      [fileId]
    );
    
    res.status(201).json(newFile[0]);
  } catch (error) {
    console.error('Error uploading greeting file:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error uploading greeting file' 
    });
  }
});

module.exports = router;
