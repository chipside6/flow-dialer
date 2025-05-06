
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

export interface DialerOptions {
  campaignId: string;
  portNumbers: number[];
  greetingFileUrl?: string;
  transferNumber?: string;
}

export const useCampaignDialer = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  const startCampaign = async (options: DialerOptions) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to start a campaign",
        variant: "destructive"
      });
      return { success: false, error: "Authentication required" };
    }
    
    if (!options.campaignId) {
      toast({
        title: "Missing Campaign",
        description: "Please select a campaign to start",
        variant: "destructive"
      });
      return { success: false, error: "Missing campaign ID" };
    }
    
    if (!options.portNumbers || options.portNumbers.length === 0) {
      toast({
        title: "No Ports Selected",
        description: "Please select at least one port to use",
        variant: "destructive"
      });
      return { success: false, error: "No ports selected" };
    }
    
    setIsStarting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("start-campaign", {
        body: {
          campaignId: options.campaignId,
          userId: user.id,
          portNumbers: options.portNumbers,
          greetingFileUrl: options.greetingFileUrl,
          transferNumber: options.transferNumber
        }
      });
      
      if (error) {
        console.error("Error starting campaign:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to start campaign",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }
      
      if (!data.success) {
        console.error("Campaign start failed:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to start campaign",
          variant: "destructive"
        });
        return { success: false, error: data.message };
      }
      
      toast({
        title: "Campaign Started",
        description: data.message || "Campaign has been started successfully"
      });
      
      setActiveJobId(data.jobId);
      
      return { success: true, jobId: data.jobId };
    } catch (error) {
      console.error("Exception starting campaign:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error starting campaign";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsStarting(false);
    }
  };

  const checkCampaignStatus = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('dialer_jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        status: data.status,
        totalCalls: data.total_calls,
        completedCalls: data.completed_calls,
        successfulCalls: data.successful_calls,
        failedCalls: data.failed_calls
      };
    } catch (error) {
      console.error("Error checking campaign status:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error checking status" };
    }
  };

  const stopCampaign = async (jobId: string) => {
    try {
      // Update job status to cancelled
      const { error } = await supabase
        .from('dialer_jobs')
        .update({ 
          status: 'cancelled',
          end_time: new Date().toISOString()
        })
        .eq('id', jobId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Campaign Stopped",
        description: "The campaign has been stopped"
      });
      
      setActiveJobId(null);
      
      return { success: true };
    } catch (error) {
      console.error("Error stopping campaign:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error stopping campaign",
        variant: "destructive"
      });
      
      return { success: false, error: error instanceof Error ? error.message : "Error stopping campaign" };
    }
  };
  
  return {
    isStarting,
    activeJobId,
    startCampaign,
    stopCampaign,
    checkCampaignStatus
  };
};
