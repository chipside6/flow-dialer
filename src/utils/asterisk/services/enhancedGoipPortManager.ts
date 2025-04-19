
import { supabase } from '@/integrations/supabase/client';
import { PortStatus } from '@/types/goipTypes';

export const enhancedGoipPortManager = {
  /**
   * Get available ports with more detailed status information
   */
  getAvailablePorts: async (userId: string, campaignId?: string): Promise<{
    ports: Array<{
      id: string;
      portNumber: number;
      deviceName: string;
      status: PortStatus;
      lastUsed: string | null;
      quality: {
        avgMosScore: number;
        recentFailures: number;
      } | null;
    }>;
    totalPorts: number;
    availablePorts: number;
  }> => {
    try {
      // Get all ports for the user with device info
      const { data: ports, error } = await supabase
        .from('user_trunks')
        .select(`
          id, 
          port_number, 
          status, 
          last_used,
          trunk_name,
          updated_at
        `)
        .eq('user_id', userId)
        .order('port_number', { ascending: true });
        
      if (error) throw error;
      
      // Get call quality data for these ports (last 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data: qualityData, error: qualityError } = await supabase
        .from('call_quality_metrics')
        .select('port_id, mos_score, created_at')
        .gt('created_at', oneDayAgo.toISOString())
        .in('port_id', ports?.map(p => p.id) || []);
        
      if (qualityError) {
        console.error('Error fetching quality data:', qualityError);
        // Continue with available port data
      }
      
      // Get recent call failures for these ports
      const { data: failures, error: failuresError } = await supabase
        .from('call_logs')
        .select('port_id, status')
        .gt('created_at', oneDayAgo.toISOString())
        .in('port_id', ports?.map(p => p.id) || [])
        .eq('status', 'failed');
        
      if (failuresError) {
        console.error('Error fetching failures:', failuresError);
        // Continue with available port data
      }
      
      // Process and return port data
      const availablePorts = (ports || [])
        .filter(p => p.status === 'active')
        .map(port => {
          // Calculate quality metrics for this port
          const portQualityData = qualityData?.filter(q => q.port_id === port.id) || [];
          const portFailures = failures?.filter(f => f.port_id === port.id) || [];
          
          const avgMosScore = portQualityData.length > 0
            ? portQualityData.reduce((sum, q) => sum + q.mos_score, 0) / portQualityData.length
            : 0;
            
          return {
            id: port.id,
            portNumber: port.port_number,
            deviceName: port.trunk_name,
            status: port.status as PortStatus,
            lastUsed: port.last_used,
            quality: portQualityData.length > 0 ? {
              avgMosScore,
              recentFailures: portFailures.length
            } : null
          };
        })
        // Sort by quality (best first) and then by last used (oldest first)
        .sort((a, b) => {
          // First sort by quality (if available)
          if (a.quality && b.quality) {
            if (a.quality.recentFailures !== b.quality.recentFailures) {
              return a.quality.recentFailures - b.quality.recentFailures;
            }
            if (a.quality.avgMosScore !== b.quality.avgMosScore) {
              return b.quality.avgMosScore - a.quality.avgMosScore;
            }
          }
          
          // Then sort by last used (oldest first)
          if (a.lastUsed && b.lastUsed) {
            return new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime();
          }
          
          // Fallback to port number
          return a.portNumber - b.portNumber;
        });
      
      return {
        ports: availablePorts,
        totalPorts: ports?.length || 0,
        availablePorts: availablePorts.length
      };
    } catch (error) {
      console.error('Error getting available ports:', error);
      throw error;
    }
  },
  
  /**
   * Mark a port as busy with enhanced status tracking
   */
  markPortBusy: async (
    userId: string, 
    portNumber: number, 
    campaignId: string, 
    callId: string
  ): Promise<boolean> => {
    try {
      // Find the port
      const { data: port, error: findError } = await supabase
        .from('user_trunks')
        .select('id')
        .eq('user_id', userId)
        .eq('port_number', portNumber)
        .single();
        
      if (findError || !port) {
        console.error('Error finding port:', findError);
        return false;
      }
      
      // Mark port as busy
      const { error: updateError } = await supabase
        .from('user_trunks')
        .update({
          status: 'busy',
          last_used: new Date().toISOString(),
          current_campaign_id: campaignId,
          current_call_id: callId,
          updated_at: new Date().toISOString()
        })
        .eq('id', port.id);
        
      if (updateError) {
        console.error('Error marking port as busy:', updateError);
        return false;
      }
      
      // Log the allocation in port_activity
      const { error: logError } = await supabase
        .from('port_activity')
        .insert({
          port_id: port.id,
          user_id: userId,
          campaign_id: campaignId,
          call_id: callId,
          activity_type: 'allocation',
          status: 'busy'
        });
        
      if (logError) {
        console.error('Error logging port activity:', logError);
        // Continue despite logging error
      }
      
      return true;
    } catch (error) {
      console.error('Error marking port as busy:', error);
      return false;
    }
  },
  
  /**
   * Release a port with status history tracking
   */
  releasePort: async (
    userId: string, 
    portNumber: number, 
    callStatus?: string
  ): Promise<boolean> => {
    try {
      // Find the port
      const { data: port, error: findError } = await supabase
        .from('user_trunks')
        .select('id, current_campaign_id, current_call_id')
        .eq('user_id', userId)
        .eq('port_number', portNumber)
        .single();
        
      if (findError || !port) {
        console.error('Error finding port:', findError);
        return false;
      }
      
      // Release the port
      const { error: updateError } = await supabase
        .from('user_trunks')
        .update({
          status: 'active',
          current_campaign_id: null,
          current_call_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', port.id);
        
      if (updateError) {
        console.error('Error releasing port:', updateError);
        return false;
      }
      
      // Log the release in port_activity
      const { error: logError } = await supabase
        .from('port_activity')
        .insert({
          port_id: port.id,
          user_id: userId,
          campaign_id: port.current_campaign_id,
          call_id: port.current_call_id,
          activity_type: 'release',
          status: 'active',
          call_status: callStatus || 'unknown'
        });
        
      if (logError) {
        console.error('Error logging port activity:', logError);
        // Continue despite logging error
      }
      
      return true;
    } catch (error) {
      console.error('Error releasing port:', error);
      return false;
    }
  },
  
  /**
   * Mark a port as having an error
   */
  markPortError: async (
    userId: string, 
    portNumber: number, 
    errorCode: string,
    errorMessage: string
  ): Promise<boolean> => {
    try {
      // Find the port
      const { data: port, error: findError } = await supabase
        .from('user_trunks')
        .select('id, current_campaign_id, current_call_id')
        .eq('user_id', userId)
        .eq('port_number', portNumber)
        .single();
        
      if (findError || !port) {
        console.error('Error finding port:', findError);
        return false;
      }
      
      // Mark port as having an error
      const { error: updateError } = await supabase
        .from('user_trunks')
        .update({
          status: 'error',
          error_code: errorCode,
          error_message: errorMessage,
          error_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', port.id);
        
      if (updateError) {
        console.error('Error marking port error:', updateError);
        return false;
      }
      
      // Log the error in port_activity
      const { error: logError } = await supabase
        .from('port_activity')
        .insert({
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
        
      if (logError) {
        console.error('Error logging port activity:', logError);
        // Continue despite logging error
      }
      
      return true;
    } catch (error) {
      console.error('Error marking port error:', error);
      return false;
    }
  },
  
  /**
   * Reset all ports for a user (e.g. after system error)
   */
  resetPorts: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_trunks')
        .update({
          status: 'active',
          current_campaign_id: null,
          current_call_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .in('status', ['busy', 'error']);
        
      if (error) {
        console.error('Error resetting ports:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting ports:', error);
      return false;
    }
  }
};
