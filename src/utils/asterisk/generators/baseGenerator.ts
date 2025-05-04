/**
 * Base configuration generators for Asterisk
 */
export const baseGenerator = {
  /**
   * Generate a SIP trunk configuration for Asterisk.
   * This function creates a reliable and flexible SIP trunk configuration.
   *
   * @param {string} providerName - The name of the SIP provider.
   * @param {string} host - The SIP provider's hostname or IP address.
   * @param {string} port - The SIP port number (default: 5060).
   * @param {string} username - The SIP username for authentication.
   * @param {string} password - The SIP password for authentication.
   * @returns {string} - The generated SIP trunk configuration.
   */
  generateSipTrunkConfig(
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string
  ): string {
    // Sanitize provider name to prevent configuration issues with special characters
    const sanitizedName = providerName.replace(/[^a-zA-Z0-9_-]/g, "");
    
    // Set default port to 5060 if not provided
    const portNumber = port ? parseInt(port, 10) : 5060;

    // Check for required fields and throw an error if missing
    if (!providerName || !host || !username || !password) {
      throw new Error('Missing required parameters for SIP trunk configuration');
    }
    
    // Return the SIP trunk configuration
    return `
[${sanitizedName}]
type=peer
host=${host}
port=${portNumber}
username=${username}
secret=${password}
fromuser=${username}
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
`.trim();
  },
  
  /**
   * Generate a basic dialplan configuration for Asterisk.
   * This dialplan includes better error handling and flexibility in call flow.
   *
   * @param {string} campaignId - The unique identifier for the campaign.
   * @param {string} greetingFileUrl - The URL or filename of the greeting audio file.
   * @param {string} transferNumber - The phone number to transfer calls to if required.
   * @returns {string} - The generated dialplan configuration.
   */
  generateDialplan(campaignId: string, greetingFileUrl: string, transferNumber: string): string {
    // Check for required parameters and throw an error if missing
    if (!campaignId) {
      throw new Error('Campaign ID is required for dialplan configuration');
    }
    
    // Provide a default greeting if none is provided
    const greeting = greetingFileUrl || 'greeting';
    
    // Handle transfer number and provide default if not provided
    const transfer = transferNumber || '';

    return `
[campaign-${campaignId}]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback(${greeting})
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to ${transfer})
exten => 1,n,Dial(SIP/${transfer},30,g)
exten => 1,n,Hangup()
`.trim();
  }
};

