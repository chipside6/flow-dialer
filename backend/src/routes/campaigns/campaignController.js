
const { pool } = require('../../config/database');

/**
 * Get all campaigns
 */
const getAllCampaigns = async (req, res) => {
  try {
    const [campaigns] = await pool.query('SELECT * FROM campaigns');
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: true, message: 'Error fetching campaigns' });
  }
};

/**
 * Create a new campaign
 */
const createCampaign = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status, 
      contact_list_id, 
      transfer_number, 
      greeting_file_url, 
      sip_provider_id,
      port_number
    } = req.body;
    
    if (!name || !status) {
      return res.status(400).json({ error: true, message: 'Campaign name and status are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO campaigns (
        name, 
        description, 
        status, 
        contact_list_id, 
        transfer_number, 
        greeting_file_url, 
        sip_provider_id,
        port_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [
        name, 
        description || "", 
        status, 
        contact_list_id || null, 
        transfer_number || null, 
        greeting_file_url || null, 
        sip_provider_id || null,
        port_number || 1
      ]
    );

    res.status(201).json({ message: 'Campaign created successfully', campaignId: result.insertId });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: true, message: 'Error creating campaign' });
  }
};

module.exports = {
  getAllCampaigns,
  createCampaign
};
