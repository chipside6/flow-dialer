
import { supabase } from '@/integrations/supabase/client';

interface PortStatus {
  id: string;
  device_id: string;
  port_number: number;
  sip_username: string;
  status: 'available' | 'busy' | 'error';
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

export const portStatusManager = {
  /**
   * Get available ports for a device
   */
  getAvailablePorts: async (deviceId: string): Promise<PortStatus[]> => {
    try {
      const { data, error } = await supabase
        .from('goip_ports')
        .select('*')
        .eq('device_id', deviceId)
        .eq('status', 'available')
        .order('last_used', { ascending: true });

      if (error) throw error;
      
      // Map the data to ensure type safety
      const ports: PortStatus[] = (data || []).map(port => ({
        id: port.id,
        device_id: port.device_id,
        port_number: port.port_number,
        sip_username: port.sip_username,
        status: port.status as 'available' | 'busy' | 'error',
        last_used: port.last_used,
        created_at: port.created_at,
        updated_at: port.updated_at
      }));

      return ports;
    } catch (error) {
      console.error('Error getting available ports:', error);
      throw error;
    }
  },

  /**
   * Mark a port as busy
   */
  markPortBusy: async (portId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('goip_ports')
        .update({
          status: 'busy',
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', portId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking port as busy:', error);
      return false;
    }
  },

  /**
   * Mark a port as available
   */
  markPortAvailable: async (portId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('goip_ports')
        .update({
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', portId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking port as available:', error);
      return false;
    }
  },

  /**
   * Mark a port as having an error
   */
  markPortError: async (portId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('goip_ports')
        .update({
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', portId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking port as error:', error);
      return false;
    }
  }
};
