import { securityUtils } from '../utils/securityUtils';

/**
 * Generates SIP configurations for users and devices
 */
export const sipConfigGenerator = {
  /**
   * Generate a SIP configuration for a GoIP port
   */
  generateGoipPortConfig: (userId: string, portNumber: number, password?: string): string => {
    const sipUser = `goip_${userId.substring(0, 8)}_port${portNumber}`;
    const sipPassword = password || securityUtils.generateSimplePassword(12);
    
    return `
[${sipUser}](goip-endpoint)
type=endpoint
context=from-goip
disallow=all
allow=ulaw,alaw
transport=transport-udp
direct_media=no
force_rport=yes
rewrite_contact=yes
ice_support=no
dtmf_mode=rfc4733
call_group=${userId}_port${portNumber}
pickup_group=${userId}_ports
max_audio_streams=1
max_contacts=1
device_state_busy_at=1
rtp_timeout=30

[${sipUser}](goip-auth)
type=auth
auth_type=userpass
username=${sipUser}
password=${sipPassword}

[${sipUser}](goip-aor)
type=aor
max_contacts=1
qualify_frequency=30
maximum_expiration=3600
minimum_expiration=60
default_expiration=120
remove_existing=yes

[${sipUser}](goip-identify)
type=identify
endpoint=${sipUser}
match=${sipUser}
`;
  },
  
  /**
   * Generate dialplan extension for GoIP port
   */
  generateGoipPortExtension: (userId: string, portNumber: number): string => {
    return `
; Extension for user ${userId} port ${portNumber}
exten => goip_${userId.substring(0, 8)}_port${portNumber},1,NoOp(Incoming call from GoIP port ${portNumber})
 same => n,Set(GROUP(port_${userId}_${portNumber})=\${CHANNEL})
 same => n,GotoIf($[\${GROUP_COUNT(port_${userId}_${portNumber})} > 1]?busy)
 same => n,Answer()
 same => n,Wait(1)
 same => n,Playback(hello-world)
 same => n,Hangup()
 same => n(busy),Busy()
 same => n,Hangup()
`;
  },
  
  /**
   * Generate outbound dialplan for a campaign
   */
  generateCampaignOutboundDialplan: (campaignId: string, userId: string): string => {
    return `
; Campaign ${campaignId} outbound dialplan
[campaign-${campaignId}-outbound]
exten => _X.,1,NoOp(Outbound call for campaign ${campaignId})
 same => n,Set(CALLERID(all)=Campaign ${campaignId} <\${EXTEN}>)
 same => n,Set(GROUP(campaign_${campaignId})=\${CHANNEL})
 same => n,GotoIf($[\${GROUP_COUNT(campaign_${campaignId}_\${PORT_NUMBER})} > 1]?busy)
 same => n,Dial(SIP/goip_${userId.substring(0, 8)}_port\${PORT_NUMBER}/\${EXTEN},30,g)
 same => n,Hangup()
 same => n(busy),NoOp(Port \${PORT_NUMBER} is busy, not placing call)
 same => n,Hangup()
`;
  },
  
  /**
   * Generate full user configuration for all ports
   */
  generateUserConfig: (userId: string, numPorts: number): string => {
    let config = `; SIP Configuration for user ${userId} with ${numPorts} ports\n\n`;
    
    // Generate SIP configuration for each port
    for (let port = 1; port <= numPorts; port++) {
      config += sipConfigGenerator.generateGoipPortConfig(userId, port);
      config += '\n';
    }
    
    // Generate a transports section
    config += `
[transport-udp-${userId}]
type=transport
protocol=udp
bind=0.0.0.0
`;
    
    return config;
  }
};
