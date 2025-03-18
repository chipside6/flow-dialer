
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CampaignData, WizardStep } from "../types";

export const useCampaignForm = (onComplete: (campaign: CampaignData) => void, user?: { id?: string }) => {
  const { toast } = useToast();
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

  const handleComplete = () => {
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
      user_id: user?.id || 'demo'
    };
    
    onComplete(newCampaign);
    
    toast({
      title: "Campaign Created",
      description: "Your new campaign has been created successfully",
    });
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
