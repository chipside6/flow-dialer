
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';

type GoipPort = Database['public']['Tables']['goip_ports']['Row'];
type ActiveCall = Database['public']['Tables']['active_calls']['Row'];

export interface PortStatus {
  portNumber: number;
  sipUser: string;
  status: 'available' | 'busy' | 'offline';
  lastStatusChange: Date;
  campaignId?: string;
  callId?: string;
}

export const goipPortManager = {
  async getAvailablePorts(userId: string): Promise<{ portId: string; portNumber: number; deviceId: string }[]> {
    try {
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

      return (data || []).map(p => ({
        portId: p.id,
        portNumber: p.port_number,
        deviceId: p.device_id
      }));
    } catch (error) {
      console.error('Error fetching available ports:', error);
      return [];
    }
  },

  async markPortBusy(userId: string, portNumber: number, campaignId: string, callId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_port_busy_atomic', {
        in_user_id: userId,
        in_port_number: portNumber,
        in_campaign_id: campaignId,
        in_call_id: callId || null
      });

      if (error) throw error;

      return data === true;
    } catch (error) {
      console.error('Error in markPortBusy:', error);
      return false;
    }
  },

  async releasePort(userId: string, portNumber: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('goip_ports')
        .select(`id, device_id, goip_devices!inner(user_id)`)
        .eq('port_number', portNumber)
        .eq('goip_devices.user_id', userId)
        .limit(1)
        .single();

      if (error || !data) throw error || new Error('Port not found');

      const portId = data.id;

      const now = new Date().toISOString();

      // End all active calls
      const { error: endError } = await supabase
        .from('active_calls')
        .update({ end_time: now, status: 'completed' })
        .eq('port_id', portId)
        .is('end_time', null);

      if (endError) throw endError;

      // Mark port available
      const { error: updateError } = await supabase
        .from('goip_ports')
        .update({ status: 'available', updated_at: now })
        .eq('id', portId);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('port_activity_logs').insert({
        port_id: portId,
        user_id: userId,
        action: 'release',
        description: `Port ${portNumber} released`,
        timestamp: now
      });

      return true;
    } catch (error) {
      console.error('Error releasing port:', error);
      return false;
    }
  },

  // NEW METHODS TO FIX TYPE ERRORS
  async getUserPorts(userId: string): Promise<PortStatus[]> {
    try {
      const { data, error } = await supabase
        .from('goip_ports')
        .select(`
          id, 
          port_number, 
          status, 
          sip_username,
          updated_at,
          goip_devices!inner(user_id),
          active_calls(campaign_id, id)
        `)
        .eq('goip_devices.user_id', userId);

      if (error) throw error;

      return (data || []).map(port => {
        const activeCalls = port.active_calls || [];
        const activeCall = activeCalls.length > 0 ? activeCalls[0] : null;
        
        return {
          portNumber: port.port_number,
          sipUser: port.sip_username || '',
          status: port.status as 'available' | 'busy' | 'offline',
          lastStatusChange: new Date(port.updated_at),
          campaignId: activeCall?.campaign_id,
          callId: activeCall?.id
        };
      });
    } catch (error) {
      console.error('Error fetching user ports:', error);
      return [];
    }
  },

  async resetPorts(userId: string): Promise<boolean> {
    try {
      // First, get all ports for this user
      const { data: ports, error: portsError } = await supabase
        .from('goip_ports')
        .select('id, goip_devices!inner(user_id)')
        .eq('goip_devices.user_id', userId);

      if (portsError) throw portsError;

      if (!ports || ports.length === 0) {
        return true; // No ports to reset
      }

      const portIds = ports.map(p => p.id);
      const now = new Date().toISOString();

      // End all active calls for these ports
      const { error: endCallsError } = await supabase
        .from('active_calls')
        .update({ end_time: now, status: 'completed' })
        .in('port_id', portIds)
        .is('end_time', null);

      if (endCallsError) throw endCallsError;

      // Mark all ports as available
      const { error: resetError } = await supabase
        .from('goip_ports')
        .update({ status: 'available', updated_at: now })
        .in('id', portIds);

      if (resetError) throw resetError;

      // Log the reset action
      await supabase.from('port_activity_logs').insert(
        portIds.map(portId => ({
          port_id: portId,
          user_id: userId,
          action: 'reset',
          description: 'Port reset to available',
          timestamp: now
        }))
      );

      return true;
    } catch (error) {
      console.error('Error resetting ports:', error);
      return false;
    }
  }
};
