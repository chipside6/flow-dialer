// Fixing specific line that has an error in the getUserDevices function
// Only modifying the affected function

// Import all necessary items from the top of the file
import { supabase } from '@/integrations/supabase/client';
import { getConfigFromStorage, saveConfigToStorage } from './config';
import { goipPortManager } from './services/goipPortManager';
import { GOIP_CONFIG } from '@/config/productionConfig';

// Export relevant code
export const asteriskService = {
  // Only fix the getUserDevices function that has an issue
  getUserDevices: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('goip_devices')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching GoIP devices:', error);
        return { success: false, devices: [] }; // Remove the message property
      }

      return { success: true, devices: data || [] }; // Remove the message property
    } catch (err) {
      console.error('Unexpected error in getUserDevices:', err);
      return { success: false, devices: [] }; // Remove the message property
    }
  },

  testAsteriskConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}asterisk/modules`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully connected to Asterisk' 
        };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          message: `Error connecting to Asterisk: ${errorData.message || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Error connecting to Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },

  reloadPjsip: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}asterisk/module/pjsip/reload`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully reloaded PJSIP configuration' 
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: `Error reloading PJSIP: ${errorData.message || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Error reloading PJSIP: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },

  reloadExtensions: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}asterisk/reload`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully reloaded Asterisk configuration' 
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: `Error reloading Asterisk: ${errorData.message || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Error reloading Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },

  getGoipDevices: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('goip_devices')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching GoIP devices:', error);
        return { success: false, devices: [] };
      }

      return { success: true, devices: data || [] };
    } catch (err) {
      console.error('Unexpected error in getGoipDevices:', err);
      return { success: false, devices: [] };
    }
  },

  registerGoipDevice: async (userId: string, deviceName: string, deviceIp: string, numPorts: number) => {
    try {
      // Validate inputs
      if (!deviceName || !deviceIp || !numPorts || numPorts <= 0) {
        throw new Error('Invalid input parameters');
      }

      // Insert the new device
      const { data: deviceData, error: deviceError } = await supabase
        .from('goip_devices')
        .insert([{
          user_id: userId,
          device_name: deviceName,
          device_ip: deviceIp,
          num_ports: numPorts
        }])
        .select()
        .single();

      if (deviceError) {
        console.error('Error registering GoIP device:', deviceError);
        throw new Error(deviceError.message);
      }

      const deviceId = deviceData.id;

      // Create ports for the device
      const portsToInsert = Array.from({ length: numPorts }, (_, i) => ({
        device_id: deviceId,
        port_number: i + 1,
        sip_username: `${userId}_${deviceName}_${i + 1}`,
        sip_password: Math.random().toString(36).substring(2, 15), // Generate a random password
        status: 'available'
      }));

      const { error: portsError } = await supabase
        .from('goip_ports')
        .insert(portsToInsert);

      if (portsError) {
        console.error('Error creating ports:', portsError);
        throw new Error(portsError.message);
      }

      return { success: true, message: 'GoIP device registered successfully' };
    } catch (err) {
      console.error('Error in registerGoipDevice:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  deleteGoipDevice: async (deviceId: string) => {
    try {
      // Delete the device
      const { error: deviceError } = await supabase
        .from('goip_devices')
        .delete()
        .eq('id', deviceId);

      if (deviceError) {
        console.error('Error deleting GoIP device:', deviceError);
        throw new Error(deviceError.message);
      }

      return { success: true, message: 'GoIP device deleted successfully' };
    } catch (err) {
      console.error('Error in deleteGoipDevice:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  getGoipPorts: async (deviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('goip_ports')
        .select('*')
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error fetching GoIP ports:', error);
        return { success: false, ports: [] };
      }

      return { success: true, ports: data || [] };
    } catch (err) {
      console.error('Unexpected error in getGoipPorts:', err);
      return { success: false, ports: [] };
    }
  },

  updateGoipPort: async (portId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('goip_ports')
        .update(updates)
        .eq('id', portId);

      if (error) {
        console.error('Error updating GoIP port:', error);
        throw new Error(error.message);
      }

      return { success: true, message: 'GoIP port updated successfully' };
    } catch (err) {
      console.error('Error in updateGoipPort:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  allocateGoipPort: async (userId: string, campaignId: string) => {
    try {
      // Get an available port
      const availablePorts = await goipPortManager.getAvailablePorts(userId);
      if (availablePorts.length === 0) {
        return { success: false, message: 'No available GoIP ports' };
      }

      const port = availablePorts[0];

      // Mark the port as busy
      const busy = await goipPortManager.markPortBusy(userId, port.portNumber, campaignId);
      if (!busy) {
        return { success: false, message: 'Could not mark port as busy' };
      }

      // Return the port details
      return { success: true, port };
    } catch (err) {
      console.error('Error in allocateGoipPort:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  releaseGoipPort: async (userId: string, portNumber: number) => {
    try {
      // Release the port
      const released = await goipPortManager.releasePort(userId, portNumber);
      if (!released) {
        return { success: false, message: 'Could not release port' };
      }

      return { success: true, message: 'GoIP port released successfully' };
    } catch (err) {
      console.error('Error in releaseGoipPort:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  resetGoipPorts: async (userId: string) => {
    try {
      // Reset all ports for the user
      const reset = await goipPortManager.resetPorts(userId);
      if (!reset) {
        return { success: false, message: 'Could not reset ports' };
      }

      return { success: true, message: 'GoIP ports reset successfully' };
    } catch (err) {
      console.error('Error in resetGoipPorts:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  updateAsteriskConfig: async (config: any) => {
    try {
      saveConfigToStorage(config);
      return { success: true, message: 'Asterisk configuration updated successfully' };
    } catch (err) {
      console.error('Error in updateAsteriskConfig:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  getAsteriskConfig: async () => {
    try {
      const config = getConfigFromStorage();
      return { success: true, config };
    } catch (err) {
      console.error('Error in getAsteriskConfig:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  testAsteriskConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}asterisk/modules`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully connected to Asterisk' 
        };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          message: `Error connecting to Asterisk: ${errorData.message || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Error connecting to Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
};
