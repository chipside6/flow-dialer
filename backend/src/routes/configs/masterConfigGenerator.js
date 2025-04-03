
const { getCachedOrGenerate } = require('./cacheService');

// Generate master configuration that automatically loads all users' campaigns
const getMasterConfig = async (req, res) => {
  try {
    const cacheKey = 'master-config';
    const masterConfig = await getCachedOrGenerate(cacheKey, async () => {
      const masterConfigText = `
; =====================================================================
; FULLY AUTOMATED MULTI-USER CAMPAIGN SYSTEM - OPTIMIZED
; =====================================================================
; This configuration automatically handles all users and campaigns
; Install this ONCE on your Asterisk server
; All campaigns will work automatically through the API

; -------------------------
; GLOBAL CONFIGURATION
; -------------------------
[globals]
API_URL=http://yourserver.com/api
API_TOKEN=YOUR_SECURE_TOKEN_HERE
RETRY_COUNT=3
CALL_TIMEOUT=30
DEBUG_LEVEL=3

; -------------------------
; DYNAMIC USER MANAGEMENT
; -------------------------
[user-campaign-manager]
; This context handles fetching configuration for any user/campaign with efficient caching
exten => _X.,1,NoOp(Fetching configuration for: \${EXTEN})
exten => _X.,n,Set(USER_ID=\${CUT(EXTEN,_,1)})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(EXTEN,_,2)})
exten => _X.,n,Set(CACHE_FILE=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.conf)
exten => _X.,n,Set(CACHE_TIME=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.time)
exten => _X.,n,TrySystem(test -f \${CACHE_FILE})
exten => _X.,n,GotoIf($[${SYSTEMSTATUS} = SUCCESS]?cache_check:fetch_new)
exten => _X.,n(cache_check),TrySystem(find \${CACHE_FILE} -mmin -60 | grep -q \${CACHE_FILE})
exten => _X.,n,GotoIf($[${SYSTEMSTATUS} = SUCCESS]?use_cache:fetch_new)
exten => _X.,n(use_cache),NoOp(Using cached configuration)
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)
exten => _X.,n(fetch_new),NoOp(Fetching fresh configuration)
exten => _X.,n,System(curl -s "\${API_URL}/configs/asterisk-campaign/\${USER_ID}/\${CAMPAIGN_ID}?token=\${API_TOKEN}" > \${CACHE_FILE})
exten => _X.,n,System(date +%s > \${CACHE_TIME})
exten => _X.,n,System(asterisk -rx "dialplan reload")
exten => _X.,n,NoOp(Configuration loaded for user \${USER_ID}, campaign \${CAMPAIGN_ID})
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)

; -------------------------
; DYNAMIC CONFIGURATION INCLUDE WITH AUTOMATIC CLEANUP
; -------------------------
#include "/tmp/campaign-config-*.conf"

; -------------------------
; INSTALLATION INSTRUCTIONS
; -------------------------
; 1. Place this file in your Asterisk server's configuration directory
; 2. Create a secure API endpoint to generate campaign configurations
; 3. Set the API_URL and API_TOKEN variables
; 4. Reload Asterisk configuration
; 5. To run a campaign, call: asterisk -rx "originate Local/USER_ID_CAMPAIGN_ID@user-campaign-manager extension USER_ID_CAMPAIGN_ID@user-campaign-manager"
; 6. The system will efficiently cache and fetch configurations as needed

; -------------------------
; AUTOMATED MAINTENANCE - ADD TO CRON
; -------------------------
; # Automatic cleanup of old cache files (add to crontab)
; 0 */4 * * * find /tmp/campaign-config-*.conf -mmin +240 -delete

; -------------------------
; API INSTRUCTIONS
; -------------------------
; Your API should have an endpoint that returns Asterisk configuration text:
; GET /configs/asterisk-campaign/{userId}/{campaignId}
; 
; The returned text should define:
; 1. The SIP provider configuration for the campaign, using the user's own SIP provider
; 2. The dialplan for handling greeting playback and transfers
; 3. Any additional settings required for the campaign
      `.trim();
      
      return { config: masterConfigText };
    });
    
    res.status(200).json(masterConfig);
  } catch (error) {
    console.error('Error generating master Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating master Asterisk configuration' });
  }
};

module.exports = { getMasterConfig };
