
import { useState, useEffect } from "react";
import { Campaign } from "@/hooks/useCampaigns";
import { useToast } from "@/components/ui/use-toast";

export const useCampaignSimulation = (initialCampaigns: Campaign[] = []) => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Load campaigns from props
  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  const startCampaign = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          // Select this campaign to view its details
          const updatedCampaign = {...campaign, status: "running" as const};
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

  const pauseCampaign = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const updatedCampaign = {...campaign, status: "paused" as const};
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
    const interval = setInterval(() => {
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
