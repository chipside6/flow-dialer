
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
    // In production, these would be fetched from environment variables or Supabase
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
      // In production, this would connect to Asterisk AMI API
      // For now, we'll simulate by checking the user_trunks table
      const { data: trunks, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (!trunks || trunks.length === 0) {
        return [];
      }
      
      // Convert to channel status format - in real implementation, we'd query Asterisk
      return trunks
        .filter(trunk => trunk.status === 'busy')
        .map(trunk => ({
          channel: `SIP/goip_${userId}_port${trunk.port_number}-00000001`,
          state: 'Up',
          callerIdNum: trunk.current_call_id || 'unknown',
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
      // Log to call_logs table
      const { error } = await supabase
        .from('call_logs')
        .insert({
          user_id: userId,
          status: event,
          phone_number: callDetails?.phone_number || 'unknown',
          campaign_id: callDetails?.campaign_id,
          notes: `Port ${portNumber} - ${event} - ${channelId || 'No channel ID'}`,
          duration: 0,
          transfer_requested: false
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging channel event:', error);
      return false;
    }
  }
};
