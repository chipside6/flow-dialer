
import { toast } from "@/components/ui/use-toast";

interface DialContactsOptions {
  contactListId: string;
  campaignId: string;
  transferNumber?: string;
  sipProviderId: string;
  greetingFile?: string;
  maxConcurrentCalls?: number;
}

// This service would connect to your backend which controls Asterisk
// In a real implementation, this would make API calls to your server
export const asteriskService = {
  /**
   * Start dialing a contact list in the background via Asterisk
   */
  startDialing: async (options: DialContactsOptions): Promise<{ jobId: string }> => {
    const { contactListId, campaignId, transferNumber, sipProviderId, greetingFile, maxConcurrentCalls } = options;
    
    console.log("Starting dial job with options:", options);
    
    // In a real implementation, this would be an API call to your backend
    // which would then control Asterisk via AMI or ARI
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful response with a job ID
    return {
      jobId: `job-${Date.now()}`
    };
  },
  
  /**
   * Stop an active dialing job
   */
  stopDialing: async (jobId: string): Promise<{ success: boolean }> => {
    console.log("Stopping dial job:", jobId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true };
  },
  
  /**
   * Get status of a dialing job
   */
  getDialingStatus: async (jobId: string): Promise<{
    status: 'running' | 'completed' | 'failed' | 'stopped';
    totalCalls: number;
    completedCalls: number;
    answeredCalls: number;
    failedCalls: number;
  }> => {
    console.log("Getting status for job:", jobId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simulate random progress
    const totalCalls = Math.floor(Math.random() * 100) + 50;
    const completedCalls = Math.floor(Math.random() * totalCalls);
    const answeredCalls = Math.floor(completedCalls * 0.7);
    const failedCalls = Math.floor(completedCalls * 0.3);
    
    return {
      status: 'running',
      totalCalls,
      completedCalls,
      answeredCalls,
      failedCalls
    };
  }
};
