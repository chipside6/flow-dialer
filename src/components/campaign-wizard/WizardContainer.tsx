
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { WizardStepTabs } from "./WizardStepTabs";
import { WizardNavigation } from "./WizardNavigation";
import { CampaignData, WizardStep } from "./types";
import { getStepAvailability } from "./utils/formValidation";

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
  const isStepAvailable = getStepAvailability(campaign);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={step} className="w-full">
          <WizardStepTabs 
            currentStep={step} 
            setStep={setStep} 
            isStepAvailable={isStepAvailable} 
          />
          {children}
        </Tabs>
      </CardContent>
      <CardFooter>
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
};
