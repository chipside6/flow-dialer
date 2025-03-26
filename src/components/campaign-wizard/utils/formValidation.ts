
import { CampaignData, WizardStep } from "../types";

export const validateStep = (step: WizardStep, campaign: CampaignData): boolean => {
  switch (step) {
    case "basics":
      return !!campaign.title && campaign.title.length >= 3;
    case "contacts":
      return !!campaign.contactListId;
    case "audio":
      return !!campaign.greetingFileId;
    case "transfers":
      return !!campaign.transferNumber && campaign.transferNumber.length >= 7;
    case "sipProvider":
      return !!campaign.sipProviderId;
    case "schedule":
      return !!campaign.schedule.startDate;
    case "review":
      return true;
    default:
      return false;
  }
};

export const getStepAvailability = (campaign: CampaignData) => {
  return {
    basics: true,
    contacts: true,
    audio: !!campaign.title,
    transfers: !!campaign.greetingFileId,
    sipProvider: !!campaign.transferNumber,
    schedule: !!campaign.sipProviderId,
    review: !!campaign.schedule.startDate
  };
};

export const getNextStep = (currentStep: WizardStep): WizardStep => {
  switch (currentStep) {
    case "basics":
      return "contacts";
    case "contacts":
      return "audio";
    case "audio":
      return "transfers";
    case "transfers":
      return "sipProvider";
    case "sipProvider":
      return "schedule";
    case "schedule":
      return "review";
    default:
      return "review";
  }
};

export const getPreviousStep = (currentStep: WizardStep): WizardStep => {
  switch (currentStep) {
    case "contacts":
      return "basics";
    case "audio":
      return "contacts";
    case "transfers":
      return "audio";
    case "sipProvider":
      return "transfers";
    case "schedule":
      return "sipProvider";
    case "review":
      return "schedule";
    default:
      return "basics";
  }
};

// Create a hook that wraps all validation functions
export const useFormValidation = () => {
  return {
    validateStep,
    getStepAvailability,
    getNextStep,
    getPreviousStep
  };
};
