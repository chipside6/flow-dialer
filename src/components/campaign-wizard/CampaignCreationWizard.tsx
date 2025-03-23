
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { BasicsStep } from "./BasicsStep";
import { ContactsStep } from "./ContactsStep";
import { AudioStep } from "./AudioStep";
import { TransfersStep } from "./TransfersStep";
import { ScheduleStep } from "./ScheduleStep";
import { ReviewStep } from "./ReviewStep";
import { WizardContainer } from "../WizardContainer";
import { CampaignData } from "./types";
import { useAuth } from "@/contexts/auth/useAuth";
import { useCampaignForm } from "./hooks/useCampaignForm";
import { useFormValidation } from "./utils/formValidation";
import { useGreetingFiles, GreetingFile } from "@/hooks/useGreetingFiles";
import { useContactLists } from "@/hooks/useContactLists";

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
    handleScheduleChange,
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
          greetingFiles={greetingFiles as GreetingFile[]}
          onSelectChange={handleSelectChange}
        />
      </TabsContent>
      
      <TabsContent value="transfers">
        <TransfersStep campaign={campaign} onChange={handleInputChange} />
      </TabsContent>
      
      <TabsContent value="schedule">
        <ScheduleStep 
          campaign={campaign}
          onChange={handleScheduleChange}
          onSelectChange={handleSelectChange}
        />
      </TabsContent>
      
      <TabsContent value="review">
        <ReviewStep 
          campaign={campaign}
          contactLists={contactLists}
          greetingFiles={greetingFiles as GreetingFile[]}
        />
      </TabsContent>
    </WizardContainer>
  );
};
