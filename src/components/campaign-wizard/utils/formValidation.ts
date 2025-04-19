import { CampaignData, WizardStep } from "../types";

export const getStepAvailability = (campaign: CampaignData) => ({
  basics: true,
  contacts: !!campaign.title,
  audio: !!campaign.contactListId,
  goip: !!campaign.greetingFileId,
  transfers: !!campaign.goip_device_id && (campaign.port_ids?.length ?? 0) > 0,
  review: !!campaign.transferNumber
});

export const validateStep = (step: WizardStep, campaign: CampaignData): boolean => {
  switch (step) {
    case "basics":
      return !!campaign.title;
    case "contacts":
      return !!campaign.contactListId;
    case "audio":
      return !!campaign.greetingFileId;
    case "goip":
      return !!campaign.goip_device_id && (campaign.port_ids?.length ?? 0) > 0;
    case "transfers":
      return !!campaign.transferNumber;
    case "review":
      return true;
    default:
      return false;
  }
};

export const getNextStep = (step: WizardStep): WizardStep => {
  switch (step) {
    case "basics":
      return "contacts";
    case "contacts":
      return "audio";
    case "audio":
      return "goip";
    case "goip":
      return "transfers";
    case "transfers":
      return "review";
    case "review":
      return "review"; // Stay on review
    default:
      return "basics";
  }
};

export const getPreviousStep = (step: WizardStep): WizardStep => {
  switch (step) {
    case "basics":
      return "basics";
    case "contacts":
      return "basics";
    case "audio":
      return "contacts";
    case "goip":
      return "audio";
    case "transfers":
      return "goip";
    case "review":
      return "transfers";
    default:
      return "review";
  }
};
