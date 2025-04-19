
import { sipConfigGenerator } from './sipConfigGenerator';

export const masterConfigGenerator = {
  /**
   * Generate master configuration for a GoIP device installation
   */
  generateMasterConfig: (userId: string = 'default', deviceId: string = 'default'): string => {
    let config = `; Master Asterisk Configuration for GoIP device ${deviceId} and user ${userId}\n\n`;

    // Generate SIP configuration for the device
    config += `; SIP Configuration for device ${deviceId}\n`;
    config += sipConfigGenerator.generateUserConfig(userId, 4); // Assuming 4 ports for simplicity
    config += '\n';

    // Generate dialplan configuration for the device
    config += `; Dialplan Configuration for device ${deviceId}\n`;
    config += sipConfigGenerator.generateGoipPortExtension(userId, 1); // Example for port 1
    config += '\n';

    // Generate outbound dialplan for campaigns
    config += `; Outbound Dialplan Configuration for campaigns\n`;
    
    // Fix the incorrect reference by using the correct method name
    const dialplanConfig = sipConfigGenerator.generateCampaignOutboundDialplan(deviceId, userId);
    config += dialplanConfig;
    config += '\n';

    // Add a default context for incoming calls
    config += `
[from-goip]
exten => _X.,1,NoOp(Incoming call to autodialer)
 same => n,Answer()
 same => n,Playback(hello-world)
 same => n,Hangup()
`;

    return config;
  }
};
