
import { Campaign } from "@/types/campaign";
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to simulate campaign progress for demo purposes
 */
export const simulateCampaignProgress = (
  campaignId: string, 
  campaigns: Campaign[], 
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>,
  setSelectedCampaign: (campaign: Campaign | null) => void,
  user: any,
  toast: any
) => {
  // Find the campaign
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign || campaign.status !== "running") return;

  // Create a random interval (between 2-4 seconds) to simulate calls being made
  const interval = setInterval(async () => {
    setCampaigns(prev => {
      const updatedCampaigns = prev.map(c => {
        if (c.id === campaignId && c.status === "running") {
          // Simulate progress
          const newProgress = Math.min(c.progress + Math.random() * 5, 100);
          const newAnswered = Math.floor((newProgress / 100) * c.totalCalls * 0.7); // 70% answer rate
          const newTransferred = Math.floor(newAnswered * 0.4); // 40% transfer rate
          const newFailed = Math.floor((newProgress / 100) * c.totalCalls * 0.3); // 30% fail rate
          
          // Explicitly type the status as one of the allowed values
          const newStatus: Campaign["status"] = newProgress >= 100 ? "completed" : "running";
          
          const updatedCampaign: Campaign = {
            ...c,
            progress: Math.round(newProgress),
            answeredCalls: newAnswered,
            transferredCalls: newTransferred,
            failedCalls: newFailed,
            status: newStatus
          };
          
          // Update selected campaign if it's the same one
          if (c.id === campaignId) {
            setSelectedCampaign(updatedCampaign);
          }
          
          // Update campaign in Supabase
          if (user) {
            supabase
              .from('campaigns')
              .update({ 
                progress: Math.round(newProgress),
                answered_calls: newAnswered,
                transferred_calls: newTransferred,
                failed_calls: newFailed,
                status: newStatus
              })
              .eq('id', campaignId)
              .eq('user_id', user.id)
              .then(({ error }) => {
                if (error) console.error("Failed to update campaign progress:", error);
              });
          }
          
          return updatedCampaign;
        }
        return c;
      });
      
      // If campaign is complete, clear the interval
      const targetCampaign = updatedCampaigns.find(c => c.id === campaignId);
      if (targetCampaign?.status === "completed") {
        clearInterval(interval);
        toast({
          title: "Campaign Completed",
          description: "All calls in the campaign have been processed.",
        });
      }
      
      return updatedCampaigns;
    });
  }, 2000 + Math.random() * 2000);
  
  // Return a cleanup function that clears the interval
  return () => clearInterval(interval);
};
