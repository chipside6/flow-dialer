
import { supabase } from '@/integrations/supabase/client';
import { securityUtils } from '../utils/securityUtils';

interface GoipDevice {
  id: string;
  user_id: string;
  device_name: string;
}

interface GoipPort {
  device_id: string;
  port_number: number;
  sip_username: string;
  sip_password: string;
}

export const deviceManager = {
  /**
   * Register a new GoIP device
   */
  registerDevice: async (userId: string, deviceName: string, numPorts: number): Promise<{ success: boolean; message: string; device?: GoipDevice }> => {
    try {
      // Insert device
      const { data: device, error: deviceError } = await supabase
        .from('goip_devices')
        .insert({
          user_id: userId,
          device_name: deviceName
        })
        .select()
        .single();

      if (deviceError) throw deviceError;
      if (!device) throw new Error('Failed to create device');

      // Create ports for the device
      const ports: GoipPort[] = Array.from({ length: numPorts }, (_, i) => ({
        device_id: device.id,
        port_number: i + 1,
        sip_username: `goip_${userId.substring(0, 8)}_${deviceName}_${i + 1}`,
        sip_password: securityUtils.generateSimplePassword(12)
      }));

      const { error: portsError } = await supabase
        .from('goip_ports')
        .insert(ports);

      if (portsError) throw portsError;

      return {
        success: true,
        message: `Device ${deviceName} registered with ${numPorts} ports`,
        device
      };
    } catch (error) {
      console.error('Error registering device:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error registering device'
      };
    }
  },

  /**
   * Get all devices for a user
   */
  getUserDevices: async (userId: string): Promise<GoipDevice[]> => {
    try {
      const { data, error } = await supabase
        .from('goip_devices')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user devices:', error);
      throw error;
    }
  }
};
