
import { useState, useEffect, useCallback } from "react";
import { Campaign } from "@/types/campaign";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useCampaignSimulation = (initialCampaigns: Campaign[] = []) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Set selected campaign when selectedCampaignId changes
  useEffect(() => {
    if (selectedCampaignId) {
      const campaign = campaigns.find(c => c.id === selectedCampaignId);
      if (campaign) {
        setSelectedCampaign(campaign);
      }
    } else {
      setSelectedCampaign(null);
    }
  }, [selectedCampaignId, campaigns]);

  // Load campaigns from props
  useEffect(() => {
    if (initialCampaigns.length > 0) {
      console.log("Setting campaigns from initialCampaigns:", initialCampaigns);
      setCampaigns(initialCampaigns);
    }
  }, [initialCampaigns]);

  const startCampaign = useCallback(async (campaignId: string) => {
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
  }, [user, toast]);

  const pauseCampaign = useCallback(async (campaignId: string) => {
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
  }, [user, toast]);

  // Add deleteCampaign function
  const deleteCampaign = useCallback(async (campaignId: string) => {
    // Update campaign status in Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', campaignId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete campaign:", err);
        toast({
          title: "Error deleting campaign",
          description: "Failed to delete the campaign",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Remove campaign from state
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    
    // Reset selected campaign if the deleted one was selected
    if (selectedCampaignId === campaignId) {
      setSelectedCampaignId(null);
    }
    
    toast({
      title: "Campaign Deleted",
      description: "The campaign has been successfully deleted.",
    });
  }, [user, toast, selectedCampaignId]);

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
    selectedCampaignId,
    setSelectedCampaign,
    setSelectedCampaignId,
    startCampaign,
    pauseCampaign,
    deleteCampaign
  };
};
