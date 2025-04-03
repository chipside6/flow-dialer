
const { pool } = require('../../config/database');
const { getCachedOrGenerate } = require('./cacheService');

// Generate configuration for a specific campaign with performance optimizations
const getCampaignConfig = async (req, res) => {
  try {
    const { userId, campaignId } = req.params;
    
    if (!userId || !campaignId) {
      return res.status(400).json({ error: true, message: 'User ID and Campaign ID are required' });
    }
    
    // Use cache for frequently accessed campaigns
    const cacheKey = `campaign-config-${userId}-${campaignId}`;
    const config = await getCachedOrGenerate(cacheKey, async () => {
      // Use a single connection and transaction for all queries
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Fetch campaign details - use direct index access instead of multiple queries
        const [campaigns] = await connection.query(
          'SELECT c.*, sp.name as provider_name, sp.host, sp.port, sp.username, sp.password ' +
          'FROM campaigns c ' +
          'LEFT JOIN sip_providers sp ON c.sip_provider_id = sp.id ' +
          'WHERE c.id = ? AND c.user_id = ?', 
          [campaignId, userId]
        );
        
        if (campaigns.length === 0) {
          await connection.commit();
          connection.release();
          return { error: true, message: 'Campaign not found' };
        }
        
        const campaign = campaigns[0];
        
        // Only fetch what we need if not already fetched in the campaign join
        let provider = null;
        if (!campaign.provider_name && campaign.sip_provider_id) {
          const [providers] = await connection.query(
            'SELECT * FROM sip_providers WHERE id = ? AND user_id = ?',
            [campaign.sip_provider_id, userId]
          );
          provider = providers[0];
        } else if (!campaign.provider_name) {
          // Fetch default provider if none specified
          const [providers] = await connection.query(
            'SELECT * FROM sip_providers WHERE user_id = ? AND active = true LIMIT 1',
            [userId]
          );
          provider = providers[0];
        } else {
          // Use the joined data
          provider = {
            name: campaign.provider_name,
            host: campaign.host,
            port: campaign.port,
            username: campaign.username,
            password: campaign.password
          };
        }
        
        // Fetch greeting file and transfer number in parallel for efficiency
        const [greetingFilesResult, transferNumbersResult] = await Promise.all([
          connection.query('SELECT * FROM greeting_files WHERE user_id = ? AND url = ? LIMIT 1', 
                          [userId, campaign.greeting_file_url || '']),
          connection.query('SELECT * FROM transfer_numbers WHERE user_id = ? AND phone_number = ? LIMIT 1', 
                          [userId, campaign.transfer_number || ''])
        ]);
        
        await connection.commit();
        connection.release();
        
        const greetingFiles = greetingFilesResult[0];
        const transferNumbers = transferNumbersResult[0];
        
        // Use first greeting/transfer if we couldn't find the specified one
        let greeting = greetingFiles[0];
        let transfer = transferNumbers[0];
        
        if (!greeting || !transfer) {
          // Fallback queries to get any greeting/transfer if needed
          if (!greeting) {
            const [fallbackGreetings] = await pool.query(
              'SELECT * FROM greeting_files WHERE user_id = ? LIMIT 1', [userId]
            );
            greeting = fallbackGreetings[0];
          }
          
          if (!transfer) {
            const [fallbackTransfers] = await pool.query(
              'SELECT * FROM transfer_numbers WHERE user_id = ? LIMIT 1', [userId]
            );
            transfer = fallbackTransfers[0];
          }
        }
        
        if (!provider || !greeting || !transfer) {
          return { 
            error: true, 
            message: 'Missing required resources for campaign',
            missingResources: {
              provider: !provider,
              greeting: !greeting,
              transfer: !transfer
            }
          };
        }
        
        // Generate optimized configuration
        const configText = `
; ===============================================
; Campaign: ${campaign.title} (ID: ${campaign.id}) - OPTIMIZED
; ===============================================

; SIP Provider Configuration (${provider.name})
; --------------------------
[${provider.name}]
type=peer
host=${provider.host}
port=${provider.port || '5060'}
username=${provider.username}
secret=${provider.password}
fromuser=${provider.username}
context=from-trunk
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
rtp_timeout=30
transport=udp

; Dialplan Configuration
; ---------------------
[campaign-${campaign.id}]
; Answer the call
exten => s,1,Answer()
; Set variables for easier management
exten => s,n,Set(GREETING=${greeting.url || 'greeting'})
exten => s,n,Set(TRANSFER_NUMBER=${transfer.phone_number || ''})
exten => s,n,Set(CAMPAIGN_ID=${campaign.id})
exten => s,n,Set(USER_ID=${userId})
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message with error handling
exten => s,n,TrySystem(test -f \${GREETING})
exten => s,n,GotoIf($[${SYSTEMSTATUS} = SUCCESS]?play:backup_greeting)
exten => s,n(play),Playback(\${GREETING})
exten => s,n,Goto(wait_input)
exten => s,n(backup_greeting),NoOp(Greeting file not found, using backup)
exten => s,n,Playback(hello-world)
; Wait for keypress with extended timeout
exten => s,n(wait_input),WaitExten(5)
; If no keypress, hang up gracefully
exten => s,n,NoOp(No input received, ending call)
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent with intelligent routing
exten => 1,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => 1,n,Set(RETRY_COUNT=0)
exten => 1,n(retry),Dial(SIP/\${TRANSFER_NUMBER},30,g)
exten => 1,n,GotoIf($[${DIALSTATUS} = BUSY]?busy:unavailable)
exten => 1,n(busy),NoOp(Transfer destination busy)
exten => 1,n,Playback(busy-please-try-again)
exten => 1,n,Goto(increment)
exten => 1,n(unavailable),NoOp(Transfer destination unavailable)  
exten => 1,n,Playback(sorry-try-again-later)
exten => 1,n(increment),Set(RETRY_COUNT=$[${RETRY_COUNT} + 1])
exten => 1,n,GotoIf($[${RETRY_COUNT} < 3]?retry:fail)
exten => 1,n(fail),NoOp(Failed to transfer after ${RETRY_COUNT} attempts)
exten => 1,n,Hangup()

; Handle other keypresses
exten => _X,1,Playback(invalid-entry)
exten => _X,n,Goto(s,wait_input)
        `.trim();
        
        return { config: configText };
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    });
    
    if (config.error) {
      return res.status(400).json(config);
    }
    
    res.status(200).json(config);
  } catch (error) {
    console.error('Error generating campaign Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating campaign Asterisk configuration' });
  }
};

module.exports = { getCampaignConfig };
