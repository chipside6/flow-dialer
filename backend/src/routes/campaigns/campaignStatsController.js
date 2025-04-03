
const { pool } = require('../../config/database');

/**
 * Get campaign call count for a user
 */
const getCampaignCallCount = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [result] = await pool.query(
      'SELECT SUM(total_calls) as totalCalls FROM campaigns WHERE user_id = ?', 
      [userId]
    );
    
    res.status(200).json({ totalCalls: result[0].totalCalls || 0 });
  } catch (error) {
    console.error('Error fetching campaign call count:', error);
    res.status(500).json({ error: true, message: 'Error fetching campaign call count' });
  }
};

module.exports = {
  getCampaignCallCount
};
