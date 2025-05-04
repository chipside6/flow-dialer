import { supabase } from '@/integrations/supabase/client';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { securityUtils } from '../utils/securityUtils';

interface GoipPort {
  port_number: number;
  sip_user: string;
  sip_pass: string;
  status?: string;
}

interface GoipDevice {
  id?: string;
  device_name: string;
  device_ip: string;
  num_ports: number;
  user_id: string;
  ports: GoipPort[];
  created_at?: string;
  updated_at?: string;
}

interface SipCredential {
  username: string;
  password: string;
  server: string;
  port: number;
}

interface UserTrunk {
  id: string;
  user_id: string;
  trunk_name: string;
  port_number: number;
  sip_user: string;
  sip_pass: string;
  status: string;
  device_ip?: string;
  created_at: string;
  updated_at: string;
}

export const goipService = {
  /**
   * Register a new GoIP device with SIP credentials.
   */
  async registerDevice(userId: string, deviceName: string, deviceIp: string, numPorts: number) {
    try {
      const ports: GoipPort[] = Array.from({ length: numPorts }, (_, i) => {
        const port = i + 1;
        return {
          port_number: port,
          sip_user: `goip_${userId.slice(0, 8)}_port${port}`,
          sip_pass: securityUtils.generateSimplePassword(12),
          status: 'active'
        };
      });

      const { error: deleteError } = await supabase
        .from('user_trunks')
        .delete()
        .eq('user_id', userId)
        .eq('trunk_name', deviceName);

      if (deleteError) throw deleteError;

      const { data: insertedData, error: insertError } = await supabase
        .from('user_trunks')
        .insert(
          ports.map(port => ({
            ...port,
            trunk_name: deviceName,
            user_id: userId,
            device_ip: deviceIp
          }))
        )
        .select();

      if (insertError || !insertedData) throw insertError;

      await goipService.syncConfiguration(userId);

      return {
        success: true,
        message: `Device ${deviceName} registered with ${numPorts} ports.`,
        device: {
          device_name: deviceName,
          device_ip: deviceIp,
          num_ports: numPorts,
          user_id: userId,
          ports: insertedData.map(d => ({
            port_number: d.port_number,
            sip_user: d.sip_user,
            sip_pass: d.sip_pass,
            status: d.status
          }))
        }
      };
    } catch (err) {
      console.error('RegisterDevice Error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Registration failed'
      };
    }
  },

  /**
   * Get all GoIP devices for a user.
   */
  async getUserDevices(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId)
        .order('port_number');

      if (error) throw error;

      const deviceMap = new Map<string, GoipDevice>();

      data.forEach((trunk: UserTrunk) => {
        if (!deviceMap.has(trunk.trunk_name)) {
          deviceMap.set(trunk.trunk_name, {
            id: trunk.id,
            device_name: trunk.trunk_name,
            device_ip: trunk.device_ip || 'dynamic',
            num_ports: 0,
            user_id: trunk.user_id,
            ports: [],
            created_at: trunk.created_at,
            updated_at: trunk.updated_at
          });
        }
        const device = deviceMap.get(trunk.trunk_name)!;
        device.num_ports++;
        device.ports.push({
          port_number: trunk.port_number,
          sip_user: trunk.sip_user,
          sip_pass: trunk.sip_pass,
          status: trunk.status
        });
      });

      return {
        success: true,
        devices: Array.from(deviceMap.values())
      };
    } catch (err) {
      console.error('getUserDevices Error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to fetch devices'
      };
    }
  },

  /**
   * Regenerate SIP credentials for a specific port.
   */
  async regenerateCredentials(userId: string, trunkId: string) {
    try {
      const { data: trunk, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('id', trunkId)
        .eq('user_id', userId)
        .single();

      if (error || !trunk) throw error || new Error('Trunk not found');

      const newPassword = securityUtils.generateSimplePassword(12);

      const { error: updateError } = await supabase
        .from('user_trunks')
        .update({
          sip_pass: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', trunkId);

      if (updateError) throw updateError;

      await goipService.syncConfiguration(userId);

      return {
        success: true,
        message: 'Credentials regenerated',
        credential: {
          username: trunk.sip_user,
          password: newPassword,
          server: import.meta.env.VITE_ASTERISK_SERVER_IP || 'your-asterisk-server.com',
          port: 5060
        }
      };
    } catch (err) {
      console.error('regenerateCredentials Error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to regenerate credentials'
      };
    }
  },

  /**
   * Sync SIP trunk configuration with Asterisk via Supabase Edge Function.
   */
  async syncConfiguration(userId: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;

      if (!accessToken) throw new Error('User not authenticated');

      const supabaseUrl = getSupabaseUrl();
      if (!supabaseUrl) throw new Error('Supabase URL missing');

      const response = await fetch(`${supabaseUrl}/functions/v1/sync-goip-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          operation: 'sync_user'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return {
        success: result.success ?? true,
        message: result.message || 'Configuration synced'
      };
    } catch (err) {
      console.error('syncConfiguration Error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to sync configuration'
      };
    }
  }
};
