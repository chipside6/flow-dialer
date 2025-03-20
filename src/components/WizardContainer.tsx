
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { WizardStepTabs } from "./campaign-wizard/WizardStepTabs";
import { WizardNavigation } from "./campaign-wizard/WizardNavigation";
import { CampaignData, WizardStep } from "./campaign-wizard/types";
import { getStepAvailability } from "./campaign-wizard/utils/formValidation";

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
    <Card className="w-full max-w-4xl mx-auto shadow-md overflow-hidden">
      <CardHeader className="border-b bg-muted/30 py-4">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={step} className="w-full">
          <WizardStepTabs 
            currentStep={step} 
            setStep={setStep} 
            isStepAvailable={isStepAvailable} 
          />
          <div className="px-4 sm:px-6 pb-6 overflow-x-auto">
            {children}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 py-4 px-4 sm:px-6">
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
