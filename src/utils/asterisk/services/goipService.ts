
import { supabase } from '@/integrations/supabase/client';
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

// Define the interface for the UserTrunk model from Supabase
interface UserTrunk {
  id: string;
  user_id: string;
  trunk_name: string;
  port_number: number;
  sip_user: string;
  sip_pass: string;
  status: string;
  device_ip?: string; // Make this optional to match potential database state
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing GoIP devices
 */
export const goipService = {
  /**
   * Register a new GoIP device
   */
  registerDevice: async (
    userId: string, 
    deviceName: string, 
    deviceIp: string, 
    numPorts: number
  ): Promise<{ success: boolean; message: string; device?: GoipDevice }> => {
    try {
      // Generate SIP credentials for each port
      const ports: GoipPort[] = [];
      
      for (let port = 1; port <= numPorts; port++) {
        const username = `goip_${userId.substring(0, 8)}_port${port}`;
        const password = securityUtils.generateSimplePassword(12);
        
        ports.push({
          port_number: port,
          sip_user: username,
          sip_pass: password,
          status: 'active'
        });
      }
      
      // Delete any existing trunks with the same name
      const { error: deleteError } = await supabase
        .from('user_trunks')
        .delete()
        .eq('user_id', userId)
        .eq('trunk_name', deviceName);
      
      if (deleteError) throw deleteError;
      
      // Insert the new ports
      const { data: insertedData, error: insertError } = await supabase
        .from('user_trunks')
        .insert(ports.map(port => ({
          port_number: port.port_number,
          sip_user: port.sip_user,
          sip_pass: port.sip_pass,
          status: port.status,
          trunk_name: deviceName,
          user_id: userId,
          device_ip: deviceIp  // Add device_ip to the database record
        })))
        .select();
      
      if (insertError) throw insertError;
      
      // Sync the configuration with Asterisk
      await goipService.syncConfiguration(userId);
      
      const processedPorts = insertedData ? insertedData.map(trunk => ({
        port_number: trunk.port_number,
        sip_user: trunk.sip_user,
        sip_pass: trunk.sip_pass,
        status: trunk.status
      })) : [];
      
      return {
        success: true,
        message: `Device ${deviceName} with ${numPorts} ports registered successfully`,
        device: {
          device_name: deviceName,
          device_ip: deviceIp,
          num_ports: numPorts,
          user_id: userId,
          ports: processedPorts
        }
      };
    } catch (error) {
      console.error('Error registering GoIP device:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  },
  
  /**
   * Get all devices for a user
   */
  getUserDevices: async (userId: string): Promise<{ 
    success: boolean; 
    devices?: GoipDevice[]; 
    message?: string 
  }> => {
    try {
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId)
        .order('port_number', { ascending: true });
      
      if (error) throw error;
      
      // Group by trunk_name to create device objects
      const deviceMap = new Map<string, GoipDevice>();
      
      data?.forEach(trunk => {
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
        
        const device = deviceMap.get(trunk.trunk_name);
        if (device) {
          device.num_ports++;
          device.ports.push({
            port_number: trunk.port_number,
            sip_user: trunk.sip_user,
            sip_pass: trunk.sip_pass,
            status: trunk.status
          });
        }
      });
      
      return {
        success: true,
        devices: Array.from(deviceMap.values())
      };
    } catch (error) {
      console.error('Error fetching user devices:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  },
  
  /**
   * Regenerate credentials for a specific port
   */
  regenerateCredentials: async (
    userId: string, 
    trunkId: string
  ): Promise<{ 
    success: boolean; 
    credential?: SipCredential; 
    message: string 
  }> => {
    try {
      // Get the existing trunk
      const { data: trunk, error: trunkError } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('id', trunkId)
        .eq('user_id', userId)
        .single();
      
      if (trunkError) throw trunkError;
      
      if (!trunk) {
        return {
          success: false,
          message: 'Trunk not found'
        };
      }
      
      // Generate a new password
      const newPassword = securityUtils.generateSimplePassword(12);
      
      // Update the trunk
      const { error: updateError } = await supabase
        .from('user_trunks')
        .update({
          sip_pass: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', trunkId);
      
      if (updateError) throw updateError;
      
      // Sync the configuration with Asterisk
      await goipService.syncConfiguration(userId);
      
      return {
        success: true,
        message: 'Credentials regenerated successfully',
        credential: {
          username: trunk.sip_user,
          password: newPassword,
          server: import.meta.env.VITE_ASTERISK_SERVER_IP || 'your-asterisk-server-ip',
          port: 5060
        }
      };
    } catch (error) {
      console.error('Error regenerating credentials:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  },
  
  /**
   * Sync user configuration with Asterisk
   */
  syncConfiguration: async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-goip-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          operation: 'sync_user'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error syncing configuration: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        success: result.success || false,
        message: result.message || 'Configuration synced successfully'
      };
    } catch (error) {
      console.error('Error syncing configuration:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
};

