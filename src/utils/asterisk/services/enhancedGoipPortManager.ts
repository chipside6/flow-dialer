import { supabase } from '@/integrations/supabase/client';
import { PortStatus } from '@/types/goipTypes';

interface PortData {
  id: string;
  portNumber: number;
  deviceName: string;
  status: PortStatus;
  lastUsed: string | null;
  quality?: {
    avgMosScore: number;
    recentFailures: number;
  } | null;
}

const now = () => new Date().toISOString();

const findPortByUserAndNumber = async (userId: string, portNumber: number) => {
  const { data, error } = await supabase
    .from('user_trunks')
    .select('id, current_campaign_id, current_call_id')
    .eq('user_id', userId)
    .eq('port_number', portNumber)
    .single();

  if (error || !data) {
    console.error(`Port not found [userId=${userId}, portNumber=${portNumber}]`, error);
    return null;
  }

  return data;
};

export const enhancedGoipPortManager = {
  getAvailablePorts: async (userId: string): Promise<{
    ports: PortData[];
    totalPorts: number;
    availablePorts: number;
  }> => {
    try {
      const { data: ports, error } = await supabase
        .from('user_trunks')
        .select('id, port_number, status, trunk_name, last_used, updated_at')
        .eq('user_id', userId)
        .order('port_number');

      if (error) throw error;

      const filtered = (ports || []).filter(p => p.status === 'active');

      // Explicitly cast status to PortStatus
      const portList: PortData[] = filtered.map(p => ({
        id: p.id,
        portNumber: p.port_number,
        deviceName: p.trunk_name,
        status: p.status as PortStatus,
        lastUsed: p.last_used,
        quality: null
      })).sort((a, b) => {
        if (a.lastUsed && b.lastUsed) {
          return new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime();
        }
        return a.portNumber - b.portNumber;
      });

      return {
        ports: portList,
        totalPorts: ports.length,
        availablePorts: portList.length
      };
    } catch (error) {
      console.error('Failed to get available ports:', error);
      return { ports: [], totalPorts: 0, availablePorts: 0 };
    }
  },

  markPortBusy: async (userId: string, portNumber: number, campaignId: string, callId: string): Promise<boolean> => {
    const port = await findPortByUserAndNumber(userId, portNumber);
    if (!port) return false;

    try {
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'busy',
          last_used: now(),
          current_campaign_id: campaignId,
          current_call_id: callId,
          updated_at: now()
        })
        .eq('id', port.id);

      if (error) throw error;

      await supabase.from('port_activity').insert({
        port_id: port.id,
        user_id: userId,
        campaign_id: campaignId,
        call_id: callId,
        activity_type: 'allocation',
        status: 'busy'
      });

      return true;
    } catch (error) {
      console.error('Failed to mark port as busy:', error);
      return false;
    }
  },

  releasePort: async (userId: string, portNumber: number, callStatus = 'unknown'): Promise<boolean> => {
    const port = await findPortByUserAndNumber(userId, portNumber);
    if (!port) return false;

    try {
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'active',
          current_campaign_id: null,
          current_call_id: null,
          updated_at: now()
        })
        .eq('id', port.id);

      if (error) throw error;

      await supabase.from('port_activity').insert({
        port_id: port.id,
        user_id: userId,
        campaign_id: port.current_campaign_id,
        call_id: port.current_call_id,
        activity_type: 'release',
        status: 'active',
        call_status: callStatus
      });

      return true;
    } catch (error) {
      console.error('Failed to release port:', error);
      return false;
    }
  },

  markPortError: async (userId: string, portNumber: number, errorCode: string, errorMessage: string): Promise<boolean> => {
    const port = await findPortByUserAndNumber(userId, portNumber);
    if (!port) return false;

    try {
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'error',
          error_code: errorCode,
          error_message: errorMessage,
          error_timestamp: now(),
          updated_at: now()
        })
        .eq('id', port.id);

      if (error) throw error;

      await supabase.from('port_activity').insert({
        port_id: port.id,
        user_id: userId,
        campaign_id: port.current_campaign_id,
        call_id: port.current_call_id,
        activity_type: 'error',
        status: 'error',
        error_details: {
          code: errorCode,
          message: errorMessage
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to mark port as error:', error);
      return false;
    }
  },

  resetPorts: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'active',
          current_campaign_id: null,
          current_call_id: null,
          updated_at: now()
        })
        .eq('user_id', userId)
        .in('status', ['busy', 'error']);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to reset ports:', error);
      return false;
    }
  }
};
