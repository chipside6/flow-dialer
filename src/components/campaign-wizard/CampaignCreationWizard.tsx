
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

interface CampaignCreationWizardProps {
  onComplete: (campaign: CampaignData) => void;
  onCancel: () => void;
}

export const CampaignCreationWizard = ({ onComplete, onCancel }: CampaignCreationWizardProps) => {
  const { user } = useAuth();
  const { validateStep, getNextStep, getPreviousStep } = useFormValidation();
  
  const {
    campaign,
    step,
    setStep,
    handleInputChange,
    handleScheduleChange,
    handleSelectChange,
    handleComplete
  } = useCampaignForm(onComplete, user);

  // Mock data for selections
  const contactLists = [
    { id: "list-1", name: "Main Customer List (250 contacts)" },
    { id: "list-2", name: "VIP Customers (50 contacts)" }
  ];

  const greetingFiles = [
    { id: "greeting-1", name: "Welcome-Message.wav" },
    { id: "greeting-2", name: "After-Hours.mp3" }
  ];

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
        />
      </TabsContent>
      
      <TabsContent value="audio">
        <AudioStep 
          campaign={campaign}
          greetingFiles={greetingFiles}
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
          greetingFiles={greetingFiles}
        />
      </TabsContent>
    </WizardContainer>
  );
};
