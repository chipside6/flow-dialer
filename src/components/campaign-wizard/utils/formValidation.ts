
import { CampaignData, WizardStep } from "../types";

export const getStepAvailability = (campaign: CampaignData): Record<WizardStep, boolean> => {
  // Basic data is always available
  const isBasicsValid = !!campaign.title; // At minimum, require a title
  
  // Contacts step is available if basics are valid
  const isContactsAvailable = isBasicsValid;
  const isContactsValid = isContactsAvailable && !!campaign.contactListId;
  
  // Audio step is available if contacts are valid
  const isAudioAvailable = isContactsValid;
  const isAudioValid = isAudioAvailable && !!campaign.greetingFileId;
  
  // Transfers step is available if audio is valid
  const isTransfersAvailable = isAudioValid;
  const isTransfersValid = isTransfersAvailable && !!campaign.transferNumber;
  
  // Review step is available if transfers are valid
  const isReviewAvailable = isTransfersValid;
  
  return {
    basics: true, // Always available
    contacts: isContactsAvailable,
    audio: isAudioAvailable,
    transfers: isTransfersAvailable,
    review: isReviewAvailable
  };
};
