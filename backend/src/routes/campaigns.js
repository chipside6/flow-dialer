
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const [campaigns] = await pool.query('SELECT * FROM campaigns');
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: true, message: 'Error fetching campaigns' });
  }
});

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status, 
      contact_list_id, 
      transfer_number, 
      greeting_file_url, 
      sip_provider_id 
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
        sip_provider_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      [
        name, 
        description || "", 
        status, 
        contact_list_id || null, 
        transfer_number || null, 
        greeting_file_url || null, 
        sip_provider_id || null
      ]
    );

    res.status(201).json({ message: 'Campaign created successfully', campaignId: result.insertId });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: true, message: 'Error creating campaign' });
  }
});

// Get campaign call count for a user
router.get('/call-count/:userId', async (req, res) => {
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
});

// Generate Asterisk configuration for a campaign
router.get('/asterisk-config/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  
  try {
    // Get campaign details including SIP provider info
    const [campaigns] = await pool.query(
      `SELECT c.*, sp.name as sip_name, sp.host, sp.port, sp.username, sp.password 
       FROM campaigns c
       LEFT JOIN sip_providers sp ON c.sip_provider_id = sp.id
       WHERE c.id = ?`, 
      [campaignId]
    );
    
    if (campaigns.length === 0) {
      return res.status(404).json({ error: true, message: 'Campaign not found' });
    }
    
    const campaign = campaigns[0];
    
    // Generate SIP configuration
    const sipConfig = campaign.sip_name ? 
      `[${campaign.sip_name}]
type=peer
host=${campaign.host}
port=${campaign.port}
username=${campaign.username}
secret=${campaign.password}
fromuser=${campaign.username}
context=from-trunk
disallow=all
allow=ulaw
allow=alaw` : '';
    
    // Generate dialplan configuration
    const dialplanConfig = `
[campaign-${campaignId}]
exten => s,1,Answer()
exten => s,n,Wait(1)
exten => s,n,Playback(${campaign.greeting_file_url || 'greeting'})
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle keypress 1 for transfer
exten => 1,1,NoOp(Transferring call to ${campaign.transfer_number || ''})
exten => 1,n,Dial(SIP/${campaign.transfer_number || ''},30)
exten => 1,n,Hangup()
    `.trim();
    
    res.status(200).json({
      sipConfig,
      dialplanConfig
    });
  } catch (error) {
    console.error('Error generating Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating Asterisk configuration' });
  }
});

module.exports = router;
