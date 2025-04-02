
import { CampaignData, WizardStep } from "../types";

// Function to validate each step of the campaign creation wizard
export const validateStep = (step: WizardStep, campaign: CampaignData): boolean => {
  switch (step) {
    case "basics":
      return campaign.title.trim() !== "" && campaign.description.trim() !== "";

    case "contacts":
      return campaign.contactListId?.trim() !== "";

    case "audio":
      return campaign.greetingFileId?.trim() !== "";

    case "transfers":
      return campaign.transferNumber?.trim() !== "";

    case "sipProvider":
      return campaign.sipProviderId?.trim() !== "";

    case "review":
      return (
        campaign.title.trim() !== "" &&
        campaign.description.trim() !== "" &&
        campaign.contactListId?.trim() !== "" &&
        campaign.greetingFileId?.trim() !== "" &&
        campaign.transferNumber?.trim() !== "" &&
        campaign.sipProviderId?.trim() !== ""
      );

    default:
      return false;
  }
};

// Function to get the next step in the wizard
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
      return "review";
    default:
      return "review";
  }
};

// Function to get the previous step in the wizard
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
    case "review":
      return "sipProvider";
    default:
      return "basics";
  }
};
