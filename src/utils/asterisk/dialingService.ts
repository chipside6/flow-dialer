
import { getConfigFromStorage } from './config';
import { goipPortManager } from './services/goipPortManager';

interface CallFlowResult {
  success: boolean;
  message: string;
}

interface DialingStatus {
  status: 'running' | 'completed' | 'failed' | 'stopped' | 'idle';
  totalCalls: number;
  completedCalls: number;
  answeredCalls: number;
  failedCalls: number;
}

interface DialingResponse {
  success: boolean;
  message: string;
  jobId?: string;
}

export const dialingService = {
  async configureCallFlow(campaignId: string, userId: string): Promise<CallFlowResult> {
    const config = getConfigFromStorage();

    try {
      if (!campaignId || !userId) {
        return { success: false, message: 'Missing campaignId or userId' };
      }

      console.log(`[CallFlow] Configuring flow for campaign ${campaignId}, user ${userId}`);
      
      // Replace with actual integration logic here (e.g., call edge function)
      
      return {
        success: true,
        message: 'Call flow configured successfully',
      };
    } catch (error) {
      console.error(`[CallFlow][Error] ${error}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async getDialingStatus(campaignId: string): Promise<DialingStatus> {
    try {
      if (!campaignId) throw new Error('Missing campaignId');

      // Replace with actual Supabase or API fetch
      return {
        status: 'running',
        totalCalls: 100,
        completedCalls: 25,
        answeredCalls: 20,
        failedCalls: 5,
      };
    } catch (error) {
      console.error(`[DialingStatus][Error] ${error}`);
      return {
        status: 'failed',
        totalCalls: 0,
        completedCalls: 0,
        answeredCalls: 0,
        failedCalls: 0,
      };
    }
  },

  async startDialing(
    campaignId: string,
    contactListId: string,
    transferNumber: string,
    portNumber = 1
  ): Promise<DialingResponse> {
    try {
      if (!campaignId || !contactListId || !transferNumber) {
        throw new Error('Missing required parameters');
      }

      const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;

      console.log(`[Dialing] Starting for campaign ${campaignId} with port ${portNumber}`);
      console.log(`[Dialing] Using Asterisk server at 192.168.0.197`);

      // Replace with edge function / Asterisk AMI call

      return {
        success: true,
        message: 'Dialing started successfully',
        jobId,
      };
    } catch (error) {
      console.error(`[Dialing][Error] ${error}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error starting dialing',
      };
    }
  },

  async startDialingWithPortAssignment(
    campaignId: string,
    contactListId: string,
    transferNumber: string,
    userId: string
  ): Promise<DialingResponse> {
    try {
      if (!campaignId || !contactListId || !transferNumber || !userId) {
        throw new Error('Missing required parameters');
      }

      const availablePorts = await goipPortManager.getAvailablePorts(userId);

      if (availablePorts.length === 0) {
        return {
          success: false,
          message: 'No available GoIP ports found',
        };
      }

      const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`[Dialing] Multi-port dialing on ${availablePorts.length} ports`);
      console.log(`[Dialing] Using Asterisk server at 192.168.0.197`);

      // Replace with call to Asterisk AMI or Edge Function

      return {
        success: true,
        message: `Dialing started successfully using ${availablePorts.length} ports`,
        jobId,
      };
    } catch (error) {
      console.error(`[DialingWithPort][Error] ${error}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during port assignment',
      };
    }
  },

  async stopDialing(campaignId: string): Promise<CallFlowResult> {
    try {
      if (!campaignId) throw new Error('Missing campaignId');

      console.log(`[Dialing] Stopping campaign ${campaignId}`);
      // Replace with actual logic to stop campaign via Asterisk or backend API

      return {
        success: true,
        message: 'Dialing stopped successfully',
      };
    } catch (error) {
      console.error(`[StopDialing][Error] ${error}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error stopping dialing',
      };
    }
  },

  async makeTestCall(phoneNumber: string, userId: string, portNumber: number): Promise<CallFlowResult> {
    try {
      if (!phoneNumber || !userId || !portNumber) {
        throw new Error('Missing required parameters for test call');
      }

      const callId = `test_${Math.random().toString(36).substring(2, 9)}`;
      const success = await goipPortManager.markPortBusy(userId, portNumber, 'test', callId);

      if (!success) {
        return {
          success: false,
          message: 'Failed to allocate port for test call',
        };
      }

      console.log(`[TestCall] Initiating test call to ${phoneNumber} via port ${portNumber}`);

      // Replace with Asterisk AMI/Originate logic
      setTimeout(async () => {
        await goipPortManager.releasePort(userId, portNumber);
        console.log(`[TestCall] Port ${portNumber} released after test`);
      }, 10000);

      return {
        success: true,
        message: `Test call initiated to ${phoneNumber} on port ${portNumber}`,
      };
    } catch (error) {
      console.error(`[TestCall][Error] ${error}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error making test call',
      };
    }
  },
};
