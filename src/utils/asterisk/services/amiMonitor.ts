
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

// Define the correct type for user_trunks
interface UserTrunk {
  id: string;
  user_id: string;
  trunk_name: string;
  port_number: number;
  sip_user: string;
  sip_pass: string;
  status: string;
  current_campaign_id?: string;
  current_call_id?: string;
  device_ip?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for monitoring Asterisk channels via AMI
 */
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
        .filter(trunk => trunk.status === 'busy') // Only include busy ports
        .map((trunk: UserTrunk) => ({
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
   * Check if a specific port is in use
   */
  isPortInUse: async (userId: string, portNumber: number): Promise<boolean> => {
    try {
      const channels = await amiMonitor.getUserChannels(userId);
      return channels.some(channel => channel.portNumber === portNumber);
    } catch (error) {
      console.error('Error checking if port is in use:', error);
      return false;
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
      // First, check if the channel_logs table exists
      const { count, error: countError } = await supabase
        .from('call_logs') // Use call_logs instead of channel_logs
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .limit(1);
      
      if (countError) {
        console.error('Error checking channel_logs table:', countError);
        return false;
      }
      
      // Log to call_logs table instead
      const { error } = await supabase
        .from('call_logs')
        .insert({
          user_id: userId,
          status: event, // Using event type as status
          phone_number: callDetails?.phone_number || 'unknown',
          campaign_id: callDetails?.campaign_id,
          notes: `Port ${portNumber} - ${event} - ${channelId || 'No channel ID'}`,
          duration: 0, // Default duration
          transfer_requested: false
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error logging channel event:', error);
      return false;
    }
  },
  
  /**
   * Update port status based on AMI information
   */
  updatePortStatusFromAmi: async (userId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would connect to Asterisk AMI
      // and update port statuses based on active channels
      
      // For now, we'll simulate the operation
      console.log(`Updating port status from AMI for user ${userId}`);
      
      // Get the user's ports
      const { data: trunks, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Simulate checking AMI status - in reality this would query Asterisk
      // For simulation, we'll just randomly mark some ports as busy
      for (const trunk of trunks || []) {
        // Random status - in reality this would come from Asterisk
        const isBusy = Math.random() > 0.7;
        
        if (isBusy !== (trunk.status === 'busy')) {
          // Update the status if it's different
          await supabase
            .from('user_trunks')
            .update({
              status: isBusy ? 'busy' : 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', trunk.id);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating port status from AMI:', error);
      return false;
    }
  }
};
