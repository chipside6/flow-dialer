import { supabase } from '@/integrations/supabase/client';
import { dialplanGenerator } from './dialplanGenerator';
import { sipConfigGenerator } from './sipConfigGenerator';

/**
 * Generate SIP configuration for a user with multiple ports.
 * This function retrieves configuration data from the database for the user.
 */
const generateSIPConfig = async (userId: string, numPorts: number): Promise<string> => {
  try {
    // Fetch user's SIP configuration from the database (e.g., Supabase or any data source)
    const { data, error } = await supabase
      .from('sip_configurations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Error fetching SIP configuration for user ${userId}: ${error.message}`);
    }

    // Generate SIP config using retrieved data (replace mock with real logic)
    return sipConfigGenerator.generateUserConfig(userId, numPorts, data.sip_password);
  } catch (error) {
    console.error(`Error generating SIP configuration for user ${userId}:`, error);
    throw new Error('Failed to generate SIP configuration.');
  }
};

/**
 * Generate GoIP port extension configuration for the user.
 * This function retrieves port-specific configurations.
 */
const generateGoIPPortExtension = async (userId: string, port: number): Promise<string> => {
  try {
    // Fetch port extension data for the user (e.g., Supabase or other data sources)
    const { data, error } = await supabase
      .from('goip_ports')
      .select('*')
      .eq('user_id', userId)
      .eq('port', port)
      .single();

    if (error) {
      throw new Error(`Error fetching GoIP port extension for user ${userId}, port ${port}: ${error.message}`);
    }

    // Generate GoIP port extension based on the fetched data
    return sipConfigGenerator.generateGoipPortExtension(userId, port, data.extension);
  } catch (error) {
    console.error(`Error generating GoIP port extension for user ${userId}, port ${port}:`, error);
    throw new Error('Failed to generate GoIP port extension.');
  }
};

/**
 * Generate campaign outbound dialplan for the user.
 * This function uses the user’s campaign settings.
 */
const generateCampaignOutboundDialplan = async (deviceId: string, userId: string): Promise<string> => {
  try {
    // Fetch campaign settings for the user (e.g., Supabase or any data source)
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .single();

    if (error) {
      throw new Error(`Error fetching campaign data for device ${deviceId}, user ${userId}: ${error.message}`);
    }

    // Generate campaign-specific dialplan
    return dialplanGenerator.generateCampaignOutboundDialplan(deviceId, userId, data);
  } catch (error) {
    console.error(`Error generating outbound dialplan for device ${deviceId}, user ${userId}:`, error);
    throw new Error('Failed to generate campaign outbound dialplan.');
  }
};

/**
 * Master configuration generator for GoIP device installation.
 */
export const masterConfigGenerator = {
  generateMasterConfig: async (userId: string = 'default', deviceId: string = 'default'): Promise<string> => {
    try {
      let config = `; Master Asterisk Configuration for GoIP device ${deviceId} and user ${userId}\n\n`;

      // Generate SIP configuration for the device
      config += `; SIP Configuration for device ${deviceId}\n`;
      config += await generateSIPConfig(userId, 4); // Assume 4 ports, modify as necessary
      config += '\n';

      // Generate GoIP port extension configuration
      config += `; GoIP Port Extension Configuration for device ${deviceId}\n`;
      config += await generateGoIPPortExtension(userId, 1); // Modify as necessary for multiple ports
      config += '\n';

      // Generate outbound dialplan for campaigns
      config += `; Outbound Dialplan Configuration for campaigns\n`;
      const dialplanConfig = await generateCampaignOutboundDialplan(deviceId, userId);
      config += dialplanConfig;
      config += '\n';

      // Default context for incoming calls
      config += `
[from-goip]
exten => _X.,1,NoOp(Incoming call to autodialer)
 same => n,Answer()
 same => n,Playback(hello-world)
 same => n,Hangup()
`;

      return config;
    } catch (error) {
      console.error('Error generating master config:', error);
      throw new Error('Failed to generate master configuration.');
    }
  }
};
