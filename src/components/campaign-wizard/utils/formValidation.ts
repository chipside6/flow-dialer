
import { CampaignData, WizardStep } from "../types";
import { useToast } from "@/components/ui/use-toast";

export const useFormValidation = () => {
  const { toast } = useToast();

  const validateStep = (step: WizardStep, campaign: CampaignData): boolean => {
    switch(step) {
      case "basics":
        if (!campaign.title) {
          toast({
            title: "Missing information",
            description: "Please provide a campaign title",
            variant: "destructive",
          });
          return false;
        }
        return true;
        
      case "contacts":
        if (!campaign.contactListId) {
          toast({
            title: "Missing information",
            description: "Please select a contact list",
            variant: "destructive",
          });
          return false;
        }
        return true;
        
      case "audio":
        if (!campaign.greetingFileId) {
          toast({
            title: "Missing information",
            description: "Please select a greeting audio file",
            variant: "destructive",
          });
          return false;
        }
        return true;
        
      case "transfers":
        if (!campaign.transferNumber) {
          toast({
            title: "Missing information",
            description: "Please provide a transfer number",
            variant: "destructive",
          });
          return false;
        }
        return true;
        
      case "schedule":
      case "review":
        return true;
        
      default:
        return true;
    }
  };

  const getNextStep = (currentStep: WizardStep): WizardStep => {
    switch(currentStep) {
      case "basics": return "contacts";
      case "contacts": return "audio";
      case "audio": return "transfers";
      case "transfers": return "schedule";
      case "schedule": return "review";
      case "review": return "review"; // Stay on review
      default: return "basics";
    }
  };

  const getPreviousStep = (currentStep: WizardStep): WizardStep => {
    switch(currentStep) {
      case "basics": return "basics"; // Stay on basics
      case "contacts": return "basics";
      case "audio": return "contacts";
      case "transfers": return "audio";
      case "schedule": return "transfers";
      case "review": return "schedule";
      default: return "basics";
    }
  };

  return {
    validateStep,
    getNextStep,
    getPreviousStep
  };
};

export const getStepAvailability = (campaign: CampaignData) => {
  return {
    contacts: !!campaign.title,
    audio: !!campaign.contactListId,
    transfers: !!campaign.greetingFileId,
    schedule: !!campaign.transferNumber,
    review: !!campaign.schedule.startDate
  };
};
