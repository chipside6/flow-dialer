
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CampaignData, WizardStep } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useCampaignForm = (onComplete: (campaign: CampaignData) => void, user?: { id?: string }) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [step, setStep] = useState<WizardStep>("basics");
  const [campaign, setCampaign] = useState<CampaignData>({
    id: `camp-${Date.now().toString(36)}`, // Generate a unique ID
    title: "",
    description: "",
    contactListId: "",
    greetingFileId: "",
    transferNumber: "",
    schedule: {
      startDate: new Date().toISOString().split("T")[0],
      maxConcurrentCalls: 5
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: value
      }
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleComplete = async () => {
    // Format campaign data for submission
    const newCampaign = {
      ...campaign,
      status: "pending" as const,
      progress: 0,
      totalCalls: 0, // This will be calculated based on the selected list
      answeredCalls: 0,
      transferredCalls: 0,
      failedCalls: 0,
      createdAt: new Date().toISOString(),
      user_id: authUser?.id || user?.id || 'demo'
    };
    
    try {
      // Save to Supabase
      if (authUser) {
        const { error } = await supabase
          .from('campaigns')
          .insert({
            title: newCampaign.title,
            description: newCampaign.description,
            status: newCampaign.status,
            progress: newCampaign.progress,
            total_calls: newCampaign.totalCalls,
            answered_calls: newCampaign.answeredCalls,
            transferred_calls: newCampaign.transferredCalls,
            failed_calls: newCampaign.failedCalls,
            user_id: authUser.id,
            contact_list_id: newCampaign.contactListId || null,
            transfer_number: newCampaign.transferNumber || null,
            greeting_file_url: newCampaign.greetingFileId || null
          });
          
        if (error) throw error;
      }
      
      onComplete(newCampaign);
      
      toast({
        title: "Campaign Created",
        description: "Your new campaign has been created successfully",
      });
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      toast({
        title: "Error creating campaign",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return {
    campaign,
    step,
    setStep,
    handleInputChange,
    handleScheduleChange,
    handleSelectChange,
    handleComplete
  };
};
