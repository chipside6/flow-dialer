
import { sipConfigGenerator } from './sipConfigGenerator';
import { dialplanGenerator } from './dialplanGenerator';

// Mock implementations for missing methods
const mockGenerateUserConfig = (userId: string, ports: number): string => {
  return `; Mock SIP Configuration for user ${userId} with ${ports} ports\n`;
};

const mockGenerateGoipPortExtension = (userId: string, port: number): string => {
  return `; Mock GoIP Port Extension for user ${userId} port ${port}\n`;
};

const mockGenerateCampaignOutboundDialplan = (deviceId: string, userId: string): string => {
  return `; Mock Campaign Outbound Dialplan for device ${deviceId} and user ${userId}\n`;
};

export const masterConfigGenerator = {
  /**
   * Generate master configuration for a GoIP device installation
   */
  generateMasterConfig: (userId: string = 'default', deviceId: string = 'default'): string => {
    let config = `; Master Asterisk Configuration for GoIP device ${deviceId} and user ${userId}\n\n`;

    // Generate SIP configuration for the device
    config += `; SIP Configuration for device ${deviceId}\n`;
    config += mockGenerateUserConfig(userId, 4); // Implemented mock method
    config += '\n';

    // Generate dialplan configuration for the device
    config += `; Dialplan Configuration for device ${deviceId}\n`;
    config += mockGenerateGoipPortExtension(userId, 1); // Implemented mock method
    config += '\n';

    // Generate outbound dialplan for campaigns
    config += `; Outbound Dialplan Configuration for campaigns\n`;
    
    // Use mock method instead of missing one
    const dialplanConfig = mockGenerateCampaignOutboundDialplan(deviceId, userId);
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
