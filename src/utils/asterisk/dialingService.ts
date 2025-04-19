
import { getConfigFromStorage } from './config';
import { goipPortManager } from './services/goipPortManager';

export const dialingService = {
  /**
   * Configure call flow for a campaign
   */
  configureCallFlow: async (campaignId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      // This would typically call an Edge Function or direct API to configure the call flow
      console.log(`Configuring call flow for campaign ${campaignId} and user ${userId}`);
      
      // Simulated success
      return { 
        success: true, 
        message: 'Call flow configured successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Error configuring call flow: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  /**
   * Get dialing status for a campaign
   */
  getDialingStatus: async (campaignId: string): Promise<{ 
    status: "running" | "completed" | "failed" | "stopped" | "idle"; 
    totalCalls: number; 
    completedCalls: number;
    answeredCalls: number;
    failedCalls: number;
  }> => {
    // This would typically fetch the status from a database or API
    return { 
      status: 'running', 
      totalCalls: 100, 
      completedCalls: 25,
      answeredCalls: 20,
      failedCalls: 5
    };
  },
  
  /**
   * Start dialing for a campaign
   */
  startDialing: async (campaignId: string, contactListId: string, transferNumber: string, portNumber = 1): Promise<{ success: boolean; message: string; jobId?: string }> => {
    // This would typically call an Edge Function or direct API to start dialing
    console.log(`Starting dialing for campaign ${campaignId}, contact list ${contactListId}, transfer to ${transferNumber}, using port ${portNumber}`);
    
    // Simulated job ID
    const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;
    
    return { 
      success: true, 
      message: 'Dialing started successfully', 
      jobId 
    };
  },
  
  /**
   * Start dialing with automatic port assignment
   */
  startDialingWithPortAssignment: async (campaignId: string, contactListId: string, transferNumber: string, userId: string): Promise<{ success: boolean; message: string; jobId?: string }> => {
    try {
      // Get available ports
      const availablePorts = await goipPortManager.getAvailablePorts(userId, campaignId);
      
      if (availablePorts.length === 0) {
        return { 
          success: false, 
          message: 'No available GoIP ports found' 
        };
      }
      
      // Create a unique job ID
      const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;
      
      // This would call our edge function to start the dialing campaign
      console.log(`Starting multi-port dialing for campaign ${campaignId}, using ${availablePorts.length} ports`);
      
      return { 
        success: true, 
        message: `Dialing started successfully using ${availablePorts.length} GoIP ports`, 
        jobId 
      };
    } catch (error) {
      console.error('Error starting dialing with port assignment:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error starting dialing' 
      };
    }
  },
  
  /**
   * Stop dialing for a campaign
   */
  stopDialing: async (campaignId: string): Promise<{ success: boolean; message: string }> => {
    // This would typically call an Edge Function or direct API to stop dialing
    console.log(`Stopping dialing for campaign ${campaignId}`);
    
    return { 
      success: true, 
      message: 'Dialing stopped successfully' 
    };
  },
  
  /**
   * Make a single test call using a specific port
   */
  makeTestCall: async (phoneNumber: string, userId: string, portNumber: number): Promise<{ success: boolean; message: string }> => {
    try {
      // Mark the port as busy for the test call
      const callId = `test_${Math.random().toString(36).substring(2, 9)}`;
      const success = await goipPortManager.markPortBusy(userId, portNumber, 'test', callId);
      
      if (!success) {
        return {
          success: false,
          message: 'Failed to allocate port for test call'
        };
      }
      
      // Simulate a call (would connect to Asterisk AMI in production)
      console.log(`Making test call to ${phoneNumber} using port ${portNumber}`);
      
      // Simulate call completion after 10 seconds
      setTimeout(async () => {
        await goipPortManager.releasePort(userId, portNumber);
        console.log(`Released port ${portNumber} after test call`);
      }, 10000);
      
      return {
        success: true,
        message: `Test call initiated to ${phoneNumber} using port ${portNumber}`
      };
    } catch (error) {
      console.error('Error making test call:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error making test call'
      };
    }
  }
};
