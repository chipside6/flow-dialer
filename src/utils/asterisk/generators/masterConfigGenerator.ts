
/**
 * Generates master configuration for Asterisk server
 * This is a complete server configuration that can handle all users
 */
export const masterConfigGenerator = {
  /**
   * Generate a complete master server configuration
   * This provides a single Asterisk config that handles all users automatically
   */
  generateMasterConfig(supabaseUrl = "https://grhvoclalziyjbjlhpml.supabase.co", supabaseAnonKey = "") {
    // Always use the provided key, never fall back to a placeholder
    const anonKey = supabaseAnonKey;
    
    if (!anonKey || anonKey === "your-key-here") {
      console.warn("WARNING: No Supabase key provided. Configuration will not work properly.");
    }
    
    return `
; =================================================================
; GLOBAL AUTOMATED CAMPAIGN SYSTEM - MASTER SERVER CONFIGURATION
; =================================================================
; This creates a complete server setup that works for all users
; Configure this ONCE and all users' campaigns will work automatically

; ------------------------
; GLOBAL API SETTINGS
; ------------------------
[globals]
; Your Supabase project URL (where Asterisk can fetch campaign configurations)
SUPABASE_URL=${supabaseUrl}
; Your Supabase anon key for API authentication
; Keep this key secure as it provides access to your database
SUPABASE_KEY=${anonKey}
RETRY_COUNT=3
CALL_TIMEOUT=30

; ------------------------
; DATABASE CONNECTOR SETUP
; ------------------------
[database-connector]
; This context handles all database operations with Supabase
exten => s,1,NoOp(Database connector activated)
exten => s,n,Set(DB_REQUEST=\${ARG1})
exten => s,n,Set(USER_ID=\${ARG2})
exten => s,n,Set(CAMPAIGN_ID=\${ARG3})
exten => s,n,System(curl -s "\${SUPABASE_URL}/rest/v1/campaigns?user_id=eq.\${USER_ID}&id=eq.\${CAMPAIGN_ID}&select=id,greeting_file_url,transfer_number" -H "apikey: \${SUPABASE_KEY}" -H "Authorization: Bearer \${SUPABASE_KEY}" -o /tmp/asterisk-data-\${USER_ID}-\${CAMPAIGN_ID}.json)
exten => s,n,NoOp(Database request complete)
exten => s,n,Return

; ------------------------
; USER CAMPAIGN ROUTER
; ------------------------
[user-campaign-router]
; Route incoming requests to the appropriate campaign
exten => _X.,1,NoOp(Routing request for: \${EXTEN})
exten => _X.,n,Set(REQUEST_DATA=\${EXTEN})
exten => _X.,n,Set(USER_ID=\${CUT(REQUEST_DATA,_,1)})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(REQUEST_DATA,_,2)})
exten => _X.,n,Gosub(database-connector,s,1(campaign,\${USER_ID},\${CAMPAIGN_ID}))
exten => _X.,n,Gosub(campaign-runner,s,1(\${USER_ID},\${CAMPAIGN_ID}))
exten => _X.,n,Hangup()

; -------------------------
; DYNAMIC CAMPAIGN RUNNER
; -------------------------
[campaign-runner]
; This macro runs any user's campaign with dynamic configuration from Supabase
exten => s,1,NoOp(Running campaign for user \${ARG1}, campaign \${ARG2})
exten => s,n,Set(USER_ID=\${ARG1})
exten => s,n,Set(CAMPAIGN_ID=\${ARG2})
exten => s,n,Answer()
exten => s,n,Wait(1)

; Extract greeting file URL from Supabase JSON response (array format)
exten => s,n,Set(GREETING_FILE=\${SHELL(cat /tmp/asterisk-data-\${USER_ID}-\${CAMPAIGN_ID}.json | jq -r '.[0].greeting_file_url')})
exten => s,n,NoOp(Playing greeting: \${GREETING_FILE})
exten => s,n,Playback(\${GREETING_FILE})

; Wait for keypress
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle transfer request
exten => 1,1,NoOp(Transfer requested)
exten => 1,n,Set(TRANSFER_NUMBER=\${SHELL(cat /tmp/asterisk-data-\${USER_ID}-\${CAMPAIGN_ID}.json | jq -r '.[0].transfer_number')})
exten => 1,n,NoOp(Transferring to: \${TRANSFER_NUMBER})
exten => 1,n,Dial(SIP/\${TRANSFER_NUMBER},30,g)
exten => 1,n,Hangup()

; -------------------------
; SIP TRUNK DYNAMIC LOADER
; -------------------------
#include "dynamic_sip_trunks/*.conf"

; -------------------------
; SYSTEM MAINTENANCE
; -------------------------
[system-maintenance]
; Scheduled tasks for system upkeep
exten => s,1,NoOp(Running system maintenance)
exten => s,n,System(find /tmp -name "asterisk-data-*" -mtime +1 -delete)
exten => s,n,Hangup()

; -------------------------
; INSTALLATION INSTRUCTIONS
; -------------------------
; 1. Place this file in /etc/asterisk/extensions.conf or include it
; 2. Create directory for dynamic SIP trunks: mkdir -p /etc/asterisk/dynamic_sip_trunks
; 3. Install jq for JSON parsing: apt-get install jq
; 4. Set up a cron job for maintenance:
;    0 2 * * * /usr/sbin/asterisk -rx "dialplan reload" && /usr/sbin/asterisk -rx "originate Local/s@system-maintenance extension s@system-maintenance"
; 5. Reload Asterisk configuration: asterisk -rx "dialplan reload"
; 
; IMPORTANT: This configuration directly accesses your Supabase database using the REST API
; Make sure your RLS (Row Level Security) policies are configured correctly for the campaigns table
`.trim();
  }
};

