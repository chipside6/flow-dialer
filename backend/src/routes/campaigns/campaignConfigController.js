
const { pool } = require('../../config/database');

/**
 * Generate Asterisk configuration for a campaign
 */
const generateAsteriskConfig = async (req, res) => {
  const { campaignId } = req.params;
  
  try {
    // Get campaign details including SIP provider info and port number
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
    
    // Generate dialplan configuration with port number
    const portNumber = campaign.port_number || 1;
    const dialplanConfig = `
[campaign-${campaignId}]
exten => s,1,Answer()
exten => s,n,Wait(1)
exten => s,n,Set(GOIP_PORT=${portNumber}) ; Set the GoIP port
exten => s,n,Playback(${campaign.greeting_file_url || 'greeting'})
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle keypress 1 for transfer
exten => 1,1,NoOp(Transferring call to ${campaign.transfer_number || ''} via port ${portNumber})
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
};

module.exports = {
  generateAsteriskConfig
};
