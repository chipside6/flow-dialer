
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WizardStep } from "./types";

interface WizardStepTabsProps {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  isStepAvailable: Record<Exclude<WizardStep, "basics">, boolean>;
}

export const WizardStepTabs = ({ currentStep, setStep, isStepAvailable }: WizardStepTabsProps) => {
  return (
    <TabsList className="grid grid-cols-6 mb-6 gap-1 overflow-x-auto">
      <TabsTrigger 
        value="basics" 
        onClick={() => currentStep !== "basics" && setStep("basics")} 
        className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2"
      >
        Basics
      </TabsTrigger>
      <TabsTrigger 
        value="contacts" 
        onClick={() => currentStep !== "contacts" && isStepAvailable.contacts && setStep("contacts")} 
        className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2"
      >
        Contacts
      </TabsTrigger>
      <TabsTrigger 
        value="audio" 
        onClick={() => currentStep !== "audio" && isStepAvailable.audio && setStep("audio")} 
        className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2"
      >
        Audio
      </TabsTrigger>
      <TabsTrigger 
        value="transfers" 
        onClick={() => currentStep !== "transfers" && isStepAvailable.transfers && setStep("transfers")} 
        className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2"
      >
        Transfers
      </TabsTrigger>
      <TabsTrigger 
        value="schedule" 
        onClick={() => currentStep !== "schedule" && isStepAvailable.schedule && setStep("schedule")} 
        className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2"
      >
        Schedule
      </TabsTrigger>
      <TabsTrigger 
        value="review" 
        onClick={() => currentStep !== "review" && isStepAvailable.review && setStep("review")} 
        className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2"
      >
        Review
      </TabsTrigger>
    </TabsList>
  );
};
