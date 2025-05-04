
iimport { supabase } from '@/integrations/supabase/client';
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

  async markPortBusy(userId: string, portNumber: number, campaignId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_port_busy_atomic', {
        in_user_id: userId,
        in_port_number: portNumber,
        in_campaign_id: campaignId
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
  }
};
