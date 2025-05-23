
import { supabase } from '@/integrations/supabase/client';

// Define types for call quality metrics
export interface CallQualityMetrics {
  latency_ms: number;
  jitter_ms: number;
  packet_loss_percent: number;
  mos_score: number; // Mean Opinion Score (1-5)
}

export const callQualityService = {
  /**
   * Log call quality metrics for a specific call
   */
  logCallQuality: async (
    callId: string,
    portId: string,
    deviceId: string,
    metrics: CallQualityMetrics
  ): Promise<boolean> => {
    try {
      // Validate incoming metrics
      if (metrics.mos_score < 1 || metrics.mos_score > 5 || metrics.packet_loss_percent < 0) {
        console.warn('Invalid metrics received:', metrics);
        return false;
      }

      // Insert call quality metrics into the database
      const { error } = await supabase
        .from('call_quality_metrics')
        .insert({
          call_id: callId,
          port_id: portId,
          device_id: deviceId,
          latency_ms: metrics.latency_ms,
          jitter_ms: metrics.jitter_ms,
          packet_loss_percent: metrics.packet_loss_percent,
          mos_score: metrics.mos_score,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting call quality metrics:', error);
        return false;
      }

      // Update port quality status if quality is poor
      if (metrics.mos_score < 2.5 || metrics.packet_loss_percent > 10) {
        const { error: updateError } = await supabase
          .from('user_trunks')
          .update({
            quality_warning: true,
            last_quality_issue: new Date().toISOString()
          })
          .eq('id', portId);

        if (updateError) {
          console.error('Error updating port quality status:', updateError);
          // Continue even if this update fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error logging call quality:', error);
      return false;
    }
  },

  /**
   * Get average quality metrics for a device
   */
  getDeviceQualityMetrics: async (deviceId: string): Promise<{
    average_mos: number;
    average_packet_loss: number;
    total_calls: number;
    problematic_calls: number;
  } | null> => {
    try {
      // Fetch call quality metrics along with the count in one query
      const { data, error, count } = await supabase
        .from('call_quality_metrics')
        .select('*', { count: 'exact' })
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error fetching call quality metrics:', error);
        return null;
      }

      // If no data is found, return default values
      if (!data || data.length === 0) {
        return {
          average_mos: 0,
          average_packet_loss: 0,
          total_calls: 0,
          problematic_calls: 0
        };
      }

      // Calculate averages and count problematic calls
      const totalCalls = count || 0;
      const avgMos = data.reduce((sum, metric) => sum + metric.mos_score, 0) / totalCalls;
      const avgPacketLoss = data.reduce((sum, metric) => sum + metric.packet_loss_percent, 0) / totalCalls;
      const problematicCalls = data.filter(
        (metric) => metric.mos_score < 2.5 || metric.packet_loss_percent > 10
      ).length;

      return {
        average_mos: parseFloat(avgMos.toFixed(2)),
        average_packet_loss: parseFloat(avgPacketLoss.toFixed(2)),
        total_calls: totalCalls,
        problematic_calls: problematicCalls
      };
    } catch (error) {
      console.error('Error getting device quality metrics:', error);
      return null;
    }
  }
};
