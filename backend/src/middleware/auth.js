
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Get authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: true, 
      message: 'Authentication required. No token provided.' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: true, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Add user ID to request
    req.userId = decoded.userId;
    req.user = { id: decoded.userId }; // For backward compatibility
    next();
  });
};

// Check if the authenticated user is an admin
const isAdmin = async (req, res, next) => {
  try {
    // Use the pool to get a connection
    const [profiles] = await require('../config/database').pool.query(
      'SELECT is_admin FROM profiles WHERE id = ?', 
      [req.userId]
    );
    
    if (profiles.length === 0 || !profiles[0].is_admin) {
      return res.status(403).json({ 
        error: true, 
        message: 'Forbidden: Admin privileges required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while verifying permissions' 
    });
  }
};

module.exports = { authenticateToken, isAdmin };
