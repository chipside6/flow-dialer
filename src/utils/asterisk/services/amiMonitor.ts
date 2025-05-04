import { supabase } from '@/integrations/supabase/client';

interface AmiCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface ChannelStatus {
  channel: string;
  state: string;
  callerIdNum: string;
  callerIdName: string;
  duration: number;
  linkedChannel?: string;
  portNumber?: number;
  userId?: string;
}

export const amiMonitor = {
  /**
   * Get credentials for AMI connection
   */
  getAmiCredentials: async (): Promise<AmiCredentials> => {
    return {
      host: import.meta.env.VITE_ASTERISK_AMI_HOST || 'localhost',
      port: parseInt(import.meta.env.VITE_ASTERISK_AMI_PORT || '5038'),
      username: import.meta.env.VITE_ASTERISK_AMI_USER || 'admin',
      password: import.meta.env.VITE_ASTERISK_AMI_PASSWORD || 'password'
    };
  },

  /**
   * Get active channels for a specific user's GoIP ports
   */
  getUserChannels: async (userId: string): Promise<ChannelStatus[]> => {
    try {
      const { data: trunks, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      if (!trunks || trunks.length === 0) return [];

      return trunks
        .filter(trunk => trunk.status === 'busy')
        .map(trunk => ({
          channel: `SIP/goip_${userId}_port${trunk.port_number}-00000001`,
          state: 'Up',
          callerIdNum: trunk.sip_user || 'unknown',
          callerIdName: `GoIP Port ${trunk.port_number}`,
          duration: 60, // Simulated duration
          portNumber: trunk.port_number,
          userId
        }));
    } catch (error) {
      console.error('Error getting user channels:', error);
      return [];
    }
  },

  /**
   * Log channel events
   */
  logChannelEvent: async (
    userId: string, 
    portNumber: number, 
    event: 'start' | 'end' | 'answered' | 'busy' | 'noanswer' | 'failed',
    channelId?: string,
    callDetails?: Record<string, any>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('call_logs')
        .insert({
          user_id: userId,
          status: event,
          phone_number: callDetails?.phone_number || 'unknown',
          campaign_id: callDetails?.campaign_id,
          notes: `Port ${portNumber} - ${event} - ${channelId || 'No channel ID'}`,
          duration: 0, // You can dynamically calculate duration
          transfer_requested: false
        });

      if (error) throw new Error(error.message);

      return true;
    } catch (error) {
      console.error('Error logging channel event:', error);
      return false;
    }
  },

  /**
   * Update port statuses based on user channels (simulated AMI data)
   */
  updatePortStatusFromAmi: async (userId: string): Promise<boolean> => {
    try {
      console.log(`Updating port statuses from AMI for user ${userId}`);

      const channels = await amiMonitor.getUserChannels(userId);
      const { data: ports, error: portsError } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId);

      if (portsError) throw new Error(portsError.message);

      if (!ports || ports.length === 0) return false;

      for (const port of ports) {
        const isActive = channels.some(channel => channel.portNumber === port.port_number);

        // Update port status only if needed
        if (isActive !== (port.status === 'busy')) {
          const newStatus = isActive ? 'busy' : 'active';
          await supabase
            .from('user_trunks')
            .update({ status: newStatus })
            .eq('id', port.id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating port status from AMI:', error);
      return false;
    }
  }
};
