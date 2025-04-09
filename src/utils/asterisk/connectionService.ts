
import { getConfigFromStorage } from './config';

export const connectionService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}/applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully connected to Asterisk ARI' 
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
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
  
  /**
   * Reload PJSIP configuration
   */
  reloadPjsip: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}/asterisk/modules/pjsip/reload`, {
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
  
  /**
   * Reload extensions (dialplan)
   */
  reloadExtensions: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}/asterisk/reload`, {
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
  }
};
