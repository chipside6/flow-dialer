
const { pool } = require('../../config/database');

/**
 * Check if a column exists in a table
 */
const checkColumnExists = async (req, res) => {
  const { table, column } = req.params;
  
  try {
    // Use information_schema to check if column exists
    const [result] = await pool.query(
      `SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ? 
        AND column_name = ?
      ) AS column_exists`,
      [table, column]
    );
    
    const exists = result.length > 0 && result[0].column_exists === 1;
    
    res.status(200).json({ exists });
  } catch (error) {
    console.error('Error checking if column exists:', error);
    res.status(500).json({ error: true, message: 'Error checking if column exists' });
  }
};

module.exports = {
  checkColumnExists
};
