
/**
 * API-based configuration generators for Asterisk
 */
export const apiGenerator = {
  /**
   * API endpoint function to generate configuration by API call
   * This can be used to integrate with external systems
   */
  generateConfigFromApi(params: any) {
    const {
      user_id,
      campaign_id,
      provider_id,
      greeting_id,
      transfer_id
    } = params;
    
    return async (fetchFunction: (url: string) => Promise<any>) => {
      try {
        // Construct API endpoint URL with parameters
        const apiUrl = `/api/asterisk/generate-config?user_id=${user_id}` + 
          (campaign_id ? `&campaign_id=${campaign_id}` : '') +
          (provider_id ? `&provider_id=${provider_id}` : '') +
          (greeting_id ? `&greeting_id=${greeting_id}` : '') +
          (transfer_id ? `&transfer_id=${transfer_id}` : '');
        
        // Fetch configuration from API
        const result = await fetchFunction(apiUrl);
        
        if (!result || !result.config) {
          throw new Error("API returned empty configuration");
        }
        
        return result.config;
      } catch (error) {
        console.error("Error fetching config from API:", error);
        return `
; Error fetching configuration from API
; -----------------------------------
; Could not fetch configuration for user ${user_id}
; Error: ${error instanceof Error ? error.message : 'Unknown error'}
; Please check the API endpoint and parameters.
        `.trim();
      }
    };
  },

  /**
   * Generate a complete configuration for an Asterisk server that uses an API to fetch all data
   * This is the most flexible approach for a fully automated system
   */
  generateApiDrivenServerConfig(apiUrl: string, apiKey: string = '') {
    const auth = apiKey ? `Authorization: Bearer ${apiKey}` : '';
    
    return `
; =================================================================
; API-DRIVEN ASTERISK CONFIGURATION
; =================================================================
; This configuration creates a completely automated system that
; fetches all campaign data from your API in real-time.
; Install this ONCE and your Asterisk server will automatically
; run all campaigns without further configuration.

[globals]
API_URL=${apiUrl}
API_KEY=${apiKey}
MAX_RETRY_COUNT=3
CALL_TIMEOUT=30
LOG_DIR=/var/log/asterisk/campaigns

; =================================================================
; REAL-TIME API ENDPOINTS
; =================================================================

[api-fetch-campaign]
; Fetch campaign details from API
exten => s,1,NoOp(Fetching campaign data for user: \${ARG1}, campaign: \${ARG2})
exten => s,n,Set(USER_ID=\${ARG1})
exten => s,n,Set(CAMPAIGN_ID=\${ARG2})
exten => s,n,Set(API_RESPONSE=\${SHELL(curl -s ${auth ? '-H "' + auth + '"' : ''} "\${API_URL}/campaigns/\${CAMPAIGN_ID}?user_id=\${USER_ID}")})
exten => s,n,Set(STATUS=\${SHELL(echo '\${API_RESPONSE}' | jq -r .status)})
exten => s,n,GotoIf($["x\${STATUS}" = "xactive"]?campaign-active:campaign-inactive)
exten => s,n(campaign-inactive),NoOp(Campaign is not active)
exten => s,n,Hangup()
exten => s,n(campaign-active),NoOp(Campaign is active)
exten => s,n,Set(GREETING_URL=\${SHELL(echo '\${API_RESPONSE}' | jq -r .greeting_file_url)})
exten => s,n,Set(TRANSFER_NUMBER=\${SHELL(echo '\${API_RESPONSE}' | jq -r .transfer_number)})
exten => s,n,Return

[api-fetch-contacts]
; Fetch contact list from API
exten => s,1,NoOp(Fetching contacts for campaign: \${ARG1})
exten => s,n,Set(CAMPAIGN_ID=\${ARG1})
exten => s,n,Set(CONTACTS=\${SHELL(curl -s ${auth ? '-H "' + auth + '"' : ''} "\${API_URL}/campaigns/\${CAMPAIGN_ID}/contacts" | jq -c '.[]')})
exten => s,n,Return

[api-update-call-status]
; Update call status in API
exten => s,1,NoOp(Updating call status: \${ARG1} for contact: \${ARG2} in campaign: \${ARG3})
exten => s,n,Set(STATUS=\${ARG1})
exten => s,n,Set(CONTACT_ID=\${ARG2})
exten => s,n,Set(CAMPAIGN_ID=\${ARG3})
exten => s,n,System(curl -s -X POST ${auth ? '-H "' + auth + '"' : ''} "\${API_URL}/calls/status" -d "campaign_id=\${CAMPAIGN_ID}&contact_id=\${CONTACT_ID}&status=\${STATUS}")
exten => s,n,Return

; =================================================================
; CAMPAIGN EXECUTION ENGINE
; =================================================================

[run-campaign]
; Main entry point for running a campaign
exten => _X.,1,NoOp(Starting campaign execution: \${EXTEN})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(EXTEN,_,2)})
exten => _X.,n,Set(USER_ID=\${CUT(EXTEN,_,1)})
exten => _X.,n,Gosub(api-fetch-campaign,s,1(\${USER_ID},\${CAMPAIGN_ID}))
exten => _X.,n,Gosub(api-fetch-contacts,s,1(\${CAMPAIGN_ID}))
exten => _X.,n,NoOp(Processing contacts for campaign \${CAMPAIGN_ID})
exten => _X.,n,Set(ITER=1)
exten => _X.,n,While($[$[\${ITER} < 100] & "$[\${CONTACTS}]" != ""])
exten => _X.,n,Set(CONTACT=\${CUT(CONTACTS,\\n,1)})
exten => _X.,n,Set(CONTACTS=\${CUT(CONTACTS,\\n,2-)})
exten => _X.,n,Set(PHONE=\${SHELL(echo '\${CONTACT}' | jq -r .phone_number)})
exten => _X.,n,Set(CONTACT_ID=\${SHELL(echo '\${CONTACT}' | jq -r .id)})
exten => _X.,n,NoOp(Dialing contact \${CONTACT_ID}: \${PHONE})
exten => _X.,n,Gosub(process-call,s,1(\${PHONE},\${CONTACT_ID},\${CAMPAIGN_ID}))
exten => _X.,n,Set(ITER=$[\${ITER} + 1])
exten => _X.,n,EndWhile()
exten => _X.,n,Hangup()

[process-call]
; Process a single call
exten => s,1,NoOp(Processing call to \${ARG1} for contact \${ARG2} in campaign \${ARG3})
exten => s,n,Set(PHONE=\${ARG1})
exten => s,n,Set(CONTACT_ID=\${ARG2})
exten => s,n,Set(CAMPAIGN_ID=\${ARG3})
exten => s,n,Set(CALLERID(num)=\${PHONE})
exten => s,n,Dial(SIP/\${PHONE}@campaign-provider,\${CALL_TIMEOUT})
exten => s,n,GotoIf($["$\{DIALSTATUS}" = "ANSWER"]?answered:failed)
exten => s,n(answered),NoOp(Call was answered)
exten => s,n,Gosub(api-update-call-status,s,1(answered,\${CONTACT_ID},\${CAMPAIGN_ID}))
exten => s,n,Goto(handle-answered-call,s,1)
exten => s,n(failed),NoOp(Call failed with status: $\{DIALSTATUS})
exten => s,n,Gosub(api-update-call-status,s,1(failed,\${CONTACT_ID},\${CAMPAIGN_ID}))
exten => s,n,Return

[handle-answered-call]
; Handle an answered call
exten => s,1,NoOp(Handling answered call)
exten => s,n,Answer()
exten => s,n,Wait(1)
exten => s,n,Playback(\${GREETING_URL})
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Transfer option
exten => 1,1,NoOp(Transfer requested)
exten => 1,n,Gosub(api-update-call-status,s,1(transferred,\${CONTACT_ID},\${CAMPAIGN_ID}))
exten => 1,n,Dial(SIP/\${TRANSFER_NUMBER},30,g)
exten => 1,n,Hangup()

; =================================================================
; AUTOMATED API PROVIDER CONFIGURATION
; =================================================================
; This section manages provider connections dynamically
; The system will query the API for provider details

[api-provider-setup]
exten => s,1,NoOp(Setting up providers from API)
exten => s,n,System(curl -s ${auth ? '-H "' + auth + '"' : ''} "\${API_URL}/providers/active" > /etc/asterisk/providers.json)
exten => s,n,System(jq -r '.[] | "register => " + .username + ":" + .password + "@" + .host + ":" + (.port|tostring)' /etc/asterisk/providers.json > /etc/asterisk/providers_register.conf)
exten => s,n,System(jq -r '.[] | "[" + .name + "]\ntype=peer\nhost=" + .host + "\nport=" + (.port|tostring) + "\nusername=" + .username + "\nsecret=" + .password + "\nfromuser=" + .username + "\ncontext=from-trunk\ndisallow=all\nallow=ulaw\nallow=alaw"' /etc/asterisk/providers.json > /etc/asterisk/providers_details.conf)
exten => s,n,System(asterisk -rx "sip reload")
exten => s,n,NoOp(Providers setup complete)
exten => s,n,Return

; =================================================================
; INSTALLATION INSTRUCTIONS
; =================================================================
; 1. Place this file in /etc/asterisk/extensions.conf or include it
; 2. Create a SIP configuration file in /etc/asterisk/sip.conf with:
;    #include providers_register.conf
;    #include providers_details.conf
; 3. Install jq: apt-get install jq
; 4. Configure logging: mkdir -p /var/log/asterisk/campaigns
; 5. Run initial provider setup: asterisk -rx "dialplan reload" && asterisk -rx "originate Local/s@api-provider-setup extension s@api-provider-setup"
; 6. Set a cron job to update providers: 0 */4 * * * /usr/sbin/asterisk -rx "originate Local/s@api-provider-setup extension s@api-provider-setup"
; 7. To run a campaign: asterisk -rx "originate Local/USER_ID_CAMPAIGN_ID@run-campaign extension USER_ID_CAMPAIGN_ID@run-campaign"
`.trim();
  }
};
