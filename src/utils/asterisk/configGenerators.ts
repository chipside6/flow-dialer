
/**
 * Configuration generators for Asterisk
 */
export const asteriskConfig = {
  /**
   * Generate a SIP trunk configuration for Asterisk
   */
  generateSipTrunkConfig(
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string
  ) {
    return `
[${providerName}]
type=peer
host=${host}
port=${port}
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
`.trim();
  },
  
  /**
   * Generate a basic dialplan configuration for Asterisk
   * Updated to include transfer number and greeting file
   */
  generateDialplan(campaignId: string, greetingFileUrl: string, transferNumber: string) {
    return `
[campaign-${campaignId}]
exten => s,1,Answer()
exten => s,n,Wait(1)
exten => s,n,Playback(${greetingFileUrl || 'greeting'})
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle keypress 1 for transfer
exten => 1,1,NoOp(Transferring call to ${transferNumber || ''})
exten => 1,n,Dial(SIP/${transferNumber || ''},30)
exten => 1,n,Hangup()
`.trim();
  },
  
  /**
   * Generate a complete configuration for a campaign
   * Combines SIP trunk config and dialplan with user's transfer number and greeting file
   */
  generateFullConfig(
    campaignId: string,
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string,
    greetingFileUrl: string,
    transferNumber: string
  ) {
    const sipConfig = this.generateSipTrunkConfig(
      providerName, 
      host, 
      port, 
      username, 
      password
    );
    
    const dialplan = this.generateDialplan(
      campaignId,
      greetingFileUrl,
      transferNumber
    );
    
    return `
; SIP Provider Configuration
${sipConfig}

; Dialplan Configuration
${dialplan}
`.trim();
  }
};

/**
 * Generate a complete SIP configuration that includes the user's transfer number and greeting file
 * @deprecated Use asteriskConfig.generateFullConfig instead
 */
export const generateCompleteConfig = (
  campaignId: string,
  sipDetails: {
    providerName: string;
    host: string;
    port: string;
    username: string;
    password: string;
  },
  userConfig: {
    transferNumber: string;
    greetingFile: string;
  }
) => {
  return asteriskConfig.generateFullConfig(
    campaignId,
    sipDetails.providerName,
    sipDetails.host,
    sipDetails.port,
    sipDetails.username,
    sipDetails.password,
    userConfig.greetingFile,
    userConfig.transferNumber
  );
};
