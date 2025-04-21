
import { supabase } from '@/integrations/supabase/client';

/**
 * SIP configuration generator for Asterisk
 * Handles generation of SIP provider configurations
 */
export const sipConfigGenerator = {
  /**
   * Generate user-specific SIP configuration with security best practices
   * for all GoIP devices and trunks
   */
  generateUserSipConfig: async (
    userId: string
  ): Promise<{ success: boolean; message: string; config?: string }> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Fetch user trunks data
      const { data: userTrunks, error: trunksError } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId);
        
      if (trunksError) {
        throw new Error(`Error fetching user trunks: ${trunksError.message}`);
      }
      
      if (!userTrunks || userTrunks.length === 0) {
        return {
          success: false,
          message: 'No SIP trunks found for user'
        };
      }
      
      // Generate SIP configuration with secure defaults
      let configContent = `
;=====================================================
; Auto-generated SIP/PJSIP Configuration 
; User ID: ${userId}
; Generated: ${new Date().toISOString()}
;=====================================================

[global]
type=global
user_agent=FlowDialer
max_forwards=70
keep_alive_interval=30

`.trim();

      // Generate trunk configurations from user trunks
      const trunkConfigs = userTrunks.map(trunk => {
        // Check if device_ip is available, otherwise use a default setting
        // Use optional chaining to prevent TypeScript errors
        const hostSetting = trunk.device_ip ? `host=${trunk.device_ip}` : 'host=dynamic';
        
        return `
[goip_${trunk.user_id}_port${trunk.port_number}]
type=endpoint
transport=transport-udp
context=from-goip
disallow=all
allow=ulaw
allow=alaw
direct_media=no
trust_id_inbound=no
device_state_busy_at=1
dtmf_mode=rfc4733
rtp_timeout=30
call_group=1
pickup_group=1
language=en
host=dynamic
auth=auth_goip_${trunk.user_id}_port${trunk.port_number}
aors=aor_goip_${trunk.user_id}_port${trunk.port_number}

[auth_goip_${trunk.user_id}_port${trunk.port_number}]
type=auth
auth_type=userpass
username=${trunk.sip_user}
password=${trunk.sip_pass}

[aor_goip_${trunk.user_id}_port${trunk.port_number}]
type=aor
max_contacts=5
remove_existing=yes
minimum_expiration=60
maximum_expiration=3600
qualify_frequency=60
`.trim();
      }).join('\n\n');
      
      // Add the trunk configurations to the main config
      configContent = `${configContent}\n\n${trunkConfigs}\n`;
      
      return {
        success: true,
        message: 'SIP configuration generated successfully',
        config: configContent
      };
    } catch (error) {
      console.error('Error generating SIP configuration:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error generating SIP configuration'
      };
    }
  }
};
