
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CampaignData, WizardStep } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { v4 as uuidv4 } from 'uuid';

export const useCampaignForm = (onComplete: (campaign: CampaignData) => void, user?: { id?: string }) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [step, setStep] = useState<WizardStep>("basics");
  const [campaign, setCampaign] = useState<CampaignData>({
    id: uuidv4(), // Generate a proper UUID instead of string prefix
    title: "",
    description: "",
    contactListId: "",
    greetingFileId: "",
    transferNumber: "",
    portNumber: 1, // Default port number to 1
    schedule: {
      startDate: new Date().toISOString().split("T")[0],
      maxConcurrentCalls: 1 // Fixed value of 1
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleComplete = async () => {
    // Format campaign data for submission
    const newCampaign = {
      ...campaign,
      schedule: {
        ...campaign.schedule,
        maxConcurrentCalls: 1 // Always enforce 1 concurrent call
      },
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
      console.log("Attempting to save campaign:", newCampaign);
      
      // Save to Supabase using snake_case column names to match the database schema
      if (authUser) {
        const { data, error } = await supabase
          .from('campaigns')
          .insert({
            id: uuidv4(), // Always generate a proper UUID here
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
            greeting_file_url: newCampaign.greetingFileId || null,
            port_number: newCampaign.portNumber || 1 // Save port number to database
          })
          .select();
          
        if (error) {
          console.error("Error saving campaign to Supabase:", error);
          throw error;
        }
        
        console.log("Campaign saved successfully. Supabase response:", data);
      } else {
        console.warn("No authenticated user found. Campaign will only be saved locally.");
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
    handleSelectChange,
    handleComplete
  };
};
