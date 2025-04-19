
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
}

/**
 * Manages GoIP port availability and status tracking
 */
export const goipPortManager = {
  /**
   * Get all ports for a user
   */
  getUserPorts: async (userId: string): Promise<PortStatus[]> => {
    try {
      // Get user's trunks from the database
      const { data: trunks, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId)
        .order('port_number', { ascending: true });
      
      if (error) throw error;
      
      if (!trunks || trunks.length === 0) {
        return [];
      }
      
      // Format as port status objects
      return trunks.map(trunk => ({
        portNumber: trunk.port_number || 1,
        sipUser: trunk.sip_user,
        status: trunk.status === 'active' ? 'available' : 'offline',
        lastStatusChange: new Date(trunk.updated_at || Date.now()),
        campaignId: null,
        callId: null
      }));
    } catch (error) {
      console.error('Error getting user ports:', error);
      throw error;
    }
  },
  
  /**
   * Get available ports for a campaign
   */
  getAvailablePorts: async (userId: string, campaignId: string): Promise<PortStatus[]> => {
    try {
      const ports = await goipPortManager.getUserPorts(userId);
      
      // Filter to only available ports
      return ports.filter(port => port.status === 'available');
    } catch (error) {
      console.error('Error getting available ports:', error);
      throw error;
    }
  },
  
  /**
   * Mark a port as busy
   */
  markPortBusy: async (userId: string, portNumber: number, campaignId: string, callId: string): Promise<boolean> => {
    try {
      // Update the port status in the database
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'busy',
          updated_at: new Date().toISOString(),
          current_campaign_id: campaignId,
          current_call_id: callId
        })
        .eq('user_id', userId)
        .eq('port_number', portNumber);
      
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
  markPortAvailable: async (userId: string, portNumber: number): Promise<boolean> => {
    try {
      // Update the port status in the database
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          current_campaign_id: null,
          current_call_id: null
        })
        .eq('user_id', userId)
        .eq('port_number', portNumber);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking port as available:', error);
      return false;
    }
  },
  
  /**
   * Assign a port to a campaign call (round-robin or first available)
   */
  assignPortToCall: async (userId: string, campaignId: string, callId: string, strategy: 'round-robin' | 'first-available' = 'first-available'): Promise<PortStatus | null> => {
    try {
      // Get available ports
      const availablePorts = await goipPortManager.getAvailablePorts(userId, campaignId);
      
      if (availablePorts.length === 0) {
        return null; // No ports available
      }
      
      let selectedPort: PortStatus;
      
      if (strategy === 'round-robin') {
        // Get the last used port for this campaign
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select('last_port_used')
          .eq('id', campaignId)
          .single();
        
        const lastPortUsed = campaignData?.last_port_used || 0;
        
        // Find the next port in rotation
        const portNumbers = availablePorts.map(port => port.portNumber);
        let nextIndex = portNumbers.findIndex(num => num > lastPortUsed);
        
        if (nextIndex === -1) {
          // Wrap around to the start
          nextIndex = 0;
        }
        
        selectedPort = availablePorts[nextIndex];
        
        // Update the last port used
        await supabase
          .from('campaigns')
          .update({ last_port_used: selectedPort.portNumber })
          .eq('id', campaignId);
      } else {
        // First available strategy - just take the first port
        selectedPort = availablePorts[0];
      }
      
      // Mark the port as busy
      const success = await goipPortManager.markPortBusy(userId, selectedPort.portNumber, campaignId, callId);
      
      if (!success) {
        throw new Error('Failed to mark port as busy');
      }
      
      return {
        ...selectedPort,
        status: 'busy',
        lastStatusChange: new Date(),
        campaignId,
        callId
      };
    } catch (error) {
      console.error('Error assigning port to call:', error);
      return null;
    }
  },
  
  /**
   * Release a port after a call is completed
   */
  releasePort: async (userId: string, portNumber: number): Promise<boolean> => {
    return goipPortManager.markPortAvailable(userId, portNumber);
  },
  
  /**
   * Reset all ports for a user to available
   */
  resetPorts: async (userId: string): Promise<boolean> => {
    try {
      // Update all ports to available
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          current_campaign_id: null,
          current_call_id: null
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error resetting ports:', error);
      return false;
    }
  }
};
