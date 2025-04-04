
import { useState, useEffect } from "react";
import { Campaign } from "@/types/campaign";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useCampaignSimulation = (initialCampaigns: Campaign[] = []) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Load campaigns from props
  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  const startCampaign = async (campaignId: string) => {
    // Update campaign status in Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ 
            status: 'running'
          })
          .eq('id', campaignId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update campaign status:", err);
        toast({
          title: "Error starting campaign",
          description: "Failed to update campaign status",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          // Select this campaign to view its details
          const updatedCampaign = {...campaign, status: "running" as Campaign["status"]};
          setSelectedCampaign(updatedCampaign);
          
          // Start the simulation for the campaign
          simulateCampaignProgress(campaignId);
          
          return updatedCampaign;
        }
        return campaign;
      })
    );
    
    toast({
      title: "Campaign Started",
      description: "The autodialer is now processing your call list.",
    });
  };

  const pauseCampaign = async (campaignId: string) => {
    // Update campaign status in Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ 
            status: 'paused'
          })
          .eq('id', campaignId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update campaign status:", err);
        toast({
          title: "Error pausing campaign",
          description: "Failed to update campaign status",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const updatedCampaign = {...campaign, status: "paused" as Campaign["status"]};
          setSelectedCampaign(updatedCampaign);
          return updatedCampaign;
        }
        return campaign;
      })
    );
    
    toast({
      title: "Campaign Paused",
      description: "The autodialer has been paused.",
    });
  };

  // Simulate campaign progress for demo purposes
  const simulateCampaignProgress = (campaignId: string) => {
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
            if (selectedCampaign?.id === campaignId) {
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
    
    // Store the interval ID somewhere so it can be cleared if needed
    return () => clearInterval(interval);
  };
  
  return {
    campaigns,
    selectedCampaign,
    setSelectedCampaign,
    startCampaign,
    pauseCampaign
  };
};
