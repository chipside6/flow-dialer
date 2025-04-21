import { toast } from "@/components/ui/use-toast";
import { CampaignData, WizardStep } from "../types";

const validateBasics = (campaign: CampaignData): boolean => {
  if (!campaign.title) {
    toast({
      title: "Campaign Title Required",
      description: "Please enter a title for this campaign",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

const validateContacts = (campaign: CampaignData): boolean => {
  if (!campaign.contactListId) {
    toast({
      title: "Contact List Required",
      description: "Please select a contact list for this campaign",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

const validateAudio = (campaign: CampaignData): boolean => {
  if (!campaign.greetingFileId) {
    toast({
      title: "Greeting Audio Required",
      description: "Please select a greeting audio for this campaign",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

const validateGoip = (campaign: CampaignData): boolean => {
  if (!campaign.goip_device_id || campaign.port_ids?.length === 0) {
    toast({
      title: "GoIP Device and Port Required",
      description: "Please select a GoIP device and at least one port for this campaign",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

const validateSchedule = (campaign: CampaignData): boolean => {
  if (!campaign.schedule?.startDate || !campaign.schedule?.maxConcurrentCalls) {
    toast({
      title: "Schedule Required",
      description: "Please configure the schedule for this campaign",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

export const validateStep = (step: WizardStep, campaign: CampaignData): boolean => {
  switch (step) {
    case 'basics':
      return validateBasics(campaign);
    case 'contacts':
      return validateContacts(campaign);
    case 'audio':
      return validateAudio(campaign);
    case 'goip':
      return validateGoip(campaign);
    case 'transfers':
      return validateTransfers(campaign);
    case 'schedule':
      return validateSchedule(campaign);
    case 'review':
      return true; // Review is always valid
    default:
      return false;
  }
};

export const getNextStep = (step: WizardStep): WizardStep => {
  switch (step) {
    case 'basics':
      return 'contacts';
    case 'contacts':
      return 'audio';
    case 'audio':
      return 'goip';
    case 'goip':
      return 'transfers';
    case 'transfers':
      return 'review';
    case 'review':
      return 'review'; // Stay on review
    default:
      return 'basics';
  }
};

export const getPreviousStep = (step: WizardStep): WizardStep => {
  switch (step) {
    case 'contacts':
      return 'basics';
    case 'audio':
      return 'contacts';
    case 'goip':
      return 'audio';
    case 'transfers':
      return 'goip';
    case 'review':
      return 'transfers';
    default:
      return 'basics';
  }
};

const validateTransfers = (campaign: CampaignData): boolean => {
  if (!campaign.transferNumber) {
    toast({
      title: "Transfer Number Required",
      description: "Please select a transfer number for this campaign",
      variant: "destructive",
    });
    return false;
  }
  return true;
};
