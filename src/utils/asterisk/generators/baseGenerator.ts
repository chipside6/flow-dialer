
/**
 * Base configuration generators for Asterisk
 */
export const baseGenerator = {
  /**
   * Generate a SIP trunk configuration for Asterisk
   * Updated with improved parameters and comments for better reliability
   */
  generateSipTrunkConfig(
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string
  ) {
    // Sanitize provider name to prevent config issues
    const sanitizedName = providerName.replace(/[^a-zA-Z0-9_-]/g, "");
    const portNumber = port ? parseInt(port) : 5060;
    
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
   * Generate a basic dialplan configuration for Asterisk
   * Updated to include more detailed comments and instructions
   */
  generateDialplan(campaignId: string, greetingFileUrl: string, transferNumber: string) {
    return `
[campaign-${campaignId}]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback(${greetingFileUrl || 'greeting'})
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to ${transferNumber || ''})
exten => 1,n,Dial(SIP/${transferNumber || ''},30,g)
exten => 1,n,Hangup()
`.trim();
  }
};
