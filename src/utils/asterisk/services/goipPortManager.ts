
import { supabase } from '@/integrations/supabase/client';

// Interface for GoIP port status
export interface PortStatus {
  portNumber: number;
  sipUser: string;
  status: 'available' | 'busy' | 'offline';
  lastStatusChange: Date;
  campaignId?: string;
  callId?: string;
}

// Interface for GoIP device with multiple ports
export interface GoipDevice {
  deviceName: string;
  userId: string;
  ports: PortStatus[];
  ipAddress?: string;
  totalPorts: number;
  onlinePorts: number;
}

/**
 * Utility for managing GoIP port allocation and status
 */
export const goipPortManager = {
  /**
   * Get all available ports for a user
   */
  getAvailablePorts: async (userId: string, campaignId?: string): Promise<{ portId: string; portNumber: number; deviceId: string }[]> => {
    try {
      // Get all available ports for this user's devices
      const { data, error } = await supabase
        .from('goip_ports')
        .select(`
          id,
          port_number,
          device_id,
          status,
          goip_devices!inner(user_id)
        `)
        .eq('status', 'available')
        .eq('goip_devices.user_id', userId);
      
      if (error) throw error;
      
      // Map to a simpler structure
      return (data || []).map(port => ({
        portId: port.id,
        portNumber: port.port_number,
        deviceId: port.device_id
      }));
    } catch (error) {
      console.error('Error getting available ports:', error);
      return [];
    }
  },
  
  /**
   * Mark a port as busy for a specific campaign or operation
   */
  markPortBusy: async (userId: string, portNumber: number, operation: string, operationId: string): Promise<boolean> => {
    try {
      // First verify the user owns this port
      const { data: ports, error: findError } = await supabase
        .from('goip_ports')
        .select(`
          id,
          device_id,
          goip_devices!inner(user_id)
        `)
        .eq('port_number', portNumber)
        .eq('goip_devices.user_id', userId)
        .eq('status', 'available');
      
      if (findError) throw findError;
      
      if (!ports || ports.length === 0) {
        return false; // Port not found or not available
      }
      
      // Update the port status
      const portId = ports[0].id;
      const { error: updateError } = await supabase
        .from('goip_ports')
        .update({
          status: 'busy',
          updated_at: new Date().toISOString()
        })
        .eq('id', portId);
      
      if (updateError) throw updateError;
      
      // Create an active call record
      const { error: callError } = await supabase
        .from('active_calls')
        .insert({
          port_id: portId,
          campaign_id: operation === 'campaign' ? operationId : null,
          status: 'active'
        });
      
      if (callError) throw callError;
      
      return true;
    } catch (error) {
      console.error('Error marking port as busy:', error);
      return false;
    }
  },
  
  /**
   * Release a port that was previously marked busy
   */
  releasePort: async (userId: string, portNumber: number): Promise<boolean> => {
    try {
      // First verify the user owns this port
      const { data: ports, error: findError } = await supabase
        .from('goip_ports')
        .select(`
          id,
          device_id,
          goip_devices!inner(user_id)
        `)
        .eq('port_number', portNumber)
        .eq('goip_devices.user_id', userId);
      
      if (findError) throw findError;
      
      if (!ports || ports.length === 0) {
        return false; // Port not found
      }
      
      const portId = ports[0].id;
      
      // End any active calls using this port
      const { error: callError } = await supabase
        .from('active_calls')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('port_id', portId)
        .is('end_time', null);
      
      if (callError) throw callError;
      
      // Update the port status
      const { error: updateError } = await supabase
        .from('goip_ports')
        .update({
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', portId);
      
      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error('Error releasing port:', error);
      return false;
    }
  },
  
  /**
   * Get all ports for a specific device
   */
  getDevicePorts: async (deviceId: string): Promise<PortStatus[]> => {
    try {
      const { data, error } = await supabase
        .from('goip_ports')
        .select(`
          id,
          port_number,
          sip_username,
          status,
          updated_at,
          active_calls(campaign_id)
        `)
        .eq('device_id', deviceId);
      
      if (error) throw error;
      
      return (data || []).map(port => ({
        portNumber: port.port_number,
        sipUser: port.sip_username,
        status: port.status as 'available' | 'busy' | 'offline',
        lastStatusChange: new Date(port.updated_at),
        campaignId: port.active_calls?.[0]?.campaign_id
      }));
    } catch (error) {
      console.error('Error getting device ports:', error);
      return [];
    }
  }
};
