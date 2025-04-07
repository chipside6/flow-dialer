
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
    
    // In MySQL, the result would be { column_exists: 0 } or { column_exists: 1 }
    const exists = result.length > 0 && result[0].column_exists === 1;
    
    res.status(200).json({ exists });
  } catch (error) {
    console.error('Error checking if column exists:', error);
    res.status(500).json({ error: true, message: 'Error checking if column exists' });
  }
};

/**
 * Get all columns of a table
 */
const getTableColumns = async (req, res) => {
  const { table } = req.params;
  
  try {
    // Use information_schema to get all columns
    const [columns] = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = 'public' 
       AND table_name = ?
       ORDER BY ordinal_position`,
      [table]
    );
    
    res.status(200).json({ columns });
  } catch (error) {
    console.error('Error getting table columns:', error);
    res.status(500).json({ error: true, message: 'Error getting table columns' });
  }
};

module.exports = {
  checkColumnExists,
  getTableColumns
};
