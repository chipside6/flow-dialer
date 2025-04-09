
import { securityUtils } from '../utils/securityUtils';

/**
 * Generates user configurations for Asterisk
 */
export const userGenerator = {
  /**
   * Generate a secure SIP password
   */
  generateSipPassword: (): string => {
    return securityUtils.generateSecureToken();
  },
  
  /**
   * Generate a SIP configuration for a user
   */
  generateSipConfig: (userId: string, portNumber: number = 1, password?: string): string => {
    const sipUser = `goip_${userId}_port${portNumber}`;
    const sipPassword = password || securityUtils.generateSecureToken();
    
    return `
[${sipUser}](goip_template)
type=auth
auth_type=userpass
username=${sipUser}
password=${sipPassword}

[${sipUser}](goip_endpoint)
auth=${sipUser}
aors=${sipUser}
callerid="GoIP ${portNumber}" <${sipUser}>
direct_media=no
disallow=all
allow=ulaw
context=goip-inbound

[${sipUser}]
type=aor
max_contacts=5
qualify_frequency=60
support_path=yes
remove_existing=yes
authenticate_qualify=no
    `;
  },
  
  /**
   * Generate an extension configuration for a user
   */
  generateExtensionConfig: (userId: string, portNumber: number = 1): string => {
    const sipUser = `goip_${userId}_port${portNumber}`;
    
    return `
[goip-inbound]
exten => ${sipUser},1,Answer()
exten => ${sipUser},n,Wait(1)
exten => ${sipUser},n,Playback(welcome)
exten => ${sipUser},n,Hangup()

[from-${sipUser}]
exten => _X.,1,NoOp(Outbound call from ${sipUser})
exten => _X.,n,Set(CALLERID(all)=\${EXTEN})
exten => _X.,n,Dial(PJSIP/\${EXTEN}@asterisk-provider,60)
exten => _X.,n,Hangup()
    `;
  },
  
  /**
   * Generate GoIP provider SIP configuration
   */
  generateProviderConfig: (providerName: string): string => {
    return `
[${providerName}]
type=endpoint
context=from-provider
disallow=all
allow=ulaw
transport=transport-udp
direct_media=no

[${providerName}]
type=auth
auth_type=userpass
username=${providerName}
password=${securityUtils.generateSecureToken()}

[${providerName}]
type=aor
contact=sip:${providerName}@example.com
qualify_frequency=60
    `;
  }
};
