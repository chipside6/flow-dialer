
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { WizardStepTabs } from "./WizardStepTabs";
import { WizardNavigation } from "./WizardNavigation";
import { CampaignData, WizardStep } from "./types";
import { useFormValidation } from "./utils/formValidation";
import { useIsMobile } from "@/hooks/use-mobile";

interface WizardContainerProps {
  title: string;
  step: WizardStep;
  campaign: CampaignData;
  setStep: (step: WizardStep) => void;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onComplete: () => void;
  children: React.ReactNode;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({
  title,
  step,
  campaign,
  setStep,
  onPrevious,
  onNext,
  onCancel,
  onComplete,
  children
}) => {
  const { getStepAvailability } = useFormValidation();
  const isStepAvailable = getStepAvailability(campaign);
  const isMobile = useIsMobile();

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md campaign-wizard">
      <CardHeader className="border-b bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <Tabs value={step} className="w-full wizard-container">
          <WizardStepTabs 
            currentStep={step} 
            setStep={setStep} 
            isStepAvailable={isStepAvailable} 
          />
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            {children}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 py-3 px-4 sm:py-4 sm:px-6">
        <WizardNavigation 
          step={step}
          onPrevious={onPrevious}
          onNext={onNext}
          onCancel={onCancel}
          onComplete={onComplete}
        />
      </CardFooter>
    </Card>
  );
}
