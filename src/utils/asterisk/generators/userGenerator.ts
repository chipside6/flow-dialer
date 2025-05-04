import { securityUtils } from '../utils/securityUtils';

/**
 * Generates user configurations for Asterisk
 */
export const userGenerator = {
  /**
   * Generate a secure SIP password using a utility function
   * @returns {string} A secure token for SIP password
   */
  generateSipPassword: (): string => {
    return securityUtils.generateSecureToken();
  },
  
  /**
   * Generate a SIP configuration for a user with customizable port and password
   * @param {string} userId - The user ID for the SIP configuration
   * @param {number} [portNumber=1] - The port number to associate with the user
   * @param {string} [password] - The SIP password, defaults to a generated token
   * @returns {string} The formatted SIP configuration for the user
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
   * Generate an extension configuration for a user (default port is 1)
   * @param {string} userId - The user ID for the extension configuration
   * @param {number} [portNumber=1] - The port number to associate with the user
   * @returns {string} The formatted extension configuration for the user
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
   * @param {string} providerName - The name of the SIP provider
   * @returns {string} The formatted GoIP provider SIP configuration
   */
  generateProviderConfig: (providerName: string): string => {
    const providerPassword = securityUtils.generateSecureToken();
    
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
password=${providerPassword}

[${providerName}]
type=aor
contact=sip:${providerName}@example.com
qualify_frequency=60
    `;
  }
};
