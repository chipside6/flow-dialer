
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { BasicsStep } from "./BasicsStep";
import { ContactsStep } from "./ContactsStep";
import { AudioStep } from "./AudioStep";
import { TransfersStep } from "./TransfersStep";
import { ReviewStep } from "./ReviewStep";
import { WizardContainer } from "./WizardContainer";
import { CampaignData, WizardStep } from "./types";
import { useAuth } from "@/contexts/auth";
import { useCampaignForm } from "./hooks/useCampaignForm";
import { useFormValidation } from "./utils/formValidation";
import { useGreetingFiles } from "@/hooks/useGreetingFiles";
import { useContactLists } from "@/hooks/useContactLists";
import { GoipDeviceStep } from './GoipDeviceStep';

interface CampaignCreationWizardProps {
  onComplete: (campaign: CampaignData) => void;
  onCancel: () => void;
}

export const CampaignCreationWizard = ({ onComplete, onCancel }: CampaignCreationWizardProps) => {
  const { user } = useAuth();
  const { validateStep, getNextStep, getPreviousStep } = useFormValidation();
  const { greetingFiles } = useGreetingFiles();
  const { lists: contactLists, isLoading: isLoadingLists } = useContactLists();
  
  const {
    campaign,
    step,
    setStep,
    handleInputChange,
    handleSelectChange,
    handleComplete
  } = useCampaignForm(onComplete, user);

  const handleNext = () => {
    if (validateStep(step, campaign)) {
      setStep(getNextStep(step));
    }
  };

  const handlePrevious = () => {
    setStep(getPreviousStep(step));
  };

  return (
    <WizardContainer
      title="Create New Campaign"
      step={step}
      campaign={campaign}
      setStep={setStep}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onCancel={onCancel}
      onComplete={handleComplete}
    >
      <TabsContent value="basics">
        <BasicsStep campaign={campaign} onChange={handleInputChange} />
      </TabsContent>
      
      <TabsContent value="contacts">
        <ContactsStep 
          campaign={campaign}
          contactLists={contactLists}
          onSelectChange={handleSelectChange}
          isLoading={isLoadingLists}
        />
      </TabsContent>
      
      <TabsContent value="audio">
        <AudioStep 
          campaign={campaign}
          greetingFiles={greetingFiles}
          onSelectChange={handleSelectChange}
        />
      </TabsContent>
      
      <TabsContent value="goip">
        <GoipDeviceStep
          selectedDeviceId={campaign.goip_device_id || ''}
          selectedPortIds={campaign.port_ids || []}
          onDeviceChange={(deviceId) => handleSelectChange('goip_device_id', deviceId)}
          onPortsChange={(portIds) => handleSelectChange('port_ids', portIds)}
        />
      </TabsContent>
      
      <TabsContent value="transfers">
        <TransfersStep 
          campaign={campaign} 
          onChange={handleInputChange} 
          onSelectChange={handleSelectChange}
        />
      </TabsContent>
      
      <TabsContent value="review">
        <ReviewStep 
          campaign={campaign}
          contactLists={contactLists}
          greetingFiles={greetingFiles}
        />
      </TabsContent>
    </WizardContainer>
  );
};

export type { CampaignCreationWizardProps };
