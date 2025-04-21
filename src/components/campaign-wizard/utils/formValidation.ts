
import { CampaignData, WizardStep } from "../types";

// The order of steps in the wizard
export const wizardSteps: WizardStep[] = [
  "basics",
  "contacts",
  "audio",
  "goip",
  "transfer-number",
  "transfers",
  "review",
];

export const useFormValidation = () => {
  const getNextStep = (currentStep: WizardStep): WizardStep => {
    const idx = wizardSteps.indexOf(currentStep);
    return wizardSteps[Math.min(idx + 1, wizardSteps.length - 1)];
  };
  const getPreviousStep = (currentStep: WizardStep): WizardStep => {
    const idx = wizardSteps.indexOf(currentStep);
    return wizardSteps[Math.max(idx - 1, 0)];
  };

  const validateStep = (step: WizardStep, campaign: CampaignData) => {
    switch (step) {
      case "basics":
        return campaign.title.trim().length > 0;
      case "contacts":
        return !!campaign.contactListId;
      case "audio":
        return !!campaign.greetingFileId;
      case "goip":
        return !!campaign.goip_device_id && campaign.port_ids && campaign.port_ids.length > 0;
      case "transfer-number":
        return !!campaign.transfer_number_id;
      case "transfers":
        return !!campaign.transferNumber || !!campaign.transfer_number_id;
      default:
        return true;
    }
  };

  const getStepAvailability = (campaign: CampaignData) => ({
    basics: true,
    contacts: !!campaign.title,
    audio: !!campaign.contactListId,
    goip: !!campaign.greetingFileId,
    "transfer-number": !!campaign.goip_device_id && campaign.port_ids && campaign.port_ids.length > 0,
    transfers: !!campaign.transfer_number_id,
    review: !!(campaign.transferNumber || campaign.transfer_number_id),
  });

  return { validateStep, getNextStep, getPreviousStep, getStepAvailability };
};

// Export the getStepAvailability function for direct use
export const getStepAvailability = (campaign: CampaignData) => ({
  basics: true,
  contacts: !!campaign.title,
  audio: !!campaign.contactListId,
  goip: !!campaign.greetingFileId,
  "transfer-number": !!campaign.goip_device_id && campaign.port_ids && campaign.port_ids.length > 0,
  transfers: !!campaign.transfer_number_id,
  review: !!(campaign.transferNumber || campaign.transfer_number_id),
});
