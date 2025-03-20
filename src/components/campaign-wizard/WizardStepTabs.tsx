
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WizardStep } from "./types";

interface WizardStepTabsProps {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  isStepAvailable: Record<Exclude<WizardStep, "basics">, boolean>;
}

export const WizardStepTabs = ({ currentStep, setStep, isStepAvailable }: WizardStepTabsProps) => {
  return (
    <ScrollArea className="w-full px-1 pb-2">
      <TabsList className="inline-flex w-full min-w-max mb-4">
        <TabsTrigger 
          value="basics" 
          onClick={() => currentStep !== "basics" && setStep("basics")} 
          className="text-xs md:text-sm px-3 py-2 whitespace-nowrap"
        >
          Basics
        </TabsTrigger>
        <TabsTrigger 
          value="contacts" 
          onClick={() => currentStep !== "contacts" && isStepAvailable.contacts && setStep("contacts")} 
          className="text-xs md:text-sm px-3 py-2 whitespace-nowrap"
        >
          Contacts
        </TabsTrigger>
        <TabsTrigger 
          value="audio" 
          onClick={() => currentStep !== "audio" && isStepAvailable.audio && setStep("audio")} 
          className="text-xs md:text-sm px-3 py-2 whitespace-nowrap"
        >
          Audio
        </TabsTrigger>
        <TabsTrigger 
          value="transfers" 
          onClick={() => currentStep !== "transfers" && isStepAvailable.transfers && setStep("transfers")} 
          className="text-xs md:text-sm px-3 py-2 whitespace-nowrap"
        >
          Transfers
        </TabsTrigger>
        <TabsTrigger 
          value="schedule" 
          onClick={() => currentStep !== "schedule" && isStepAvailable.schedule && setStep("schedule")} 
          className="text-xs md:text-sm px-3 py-2 whitespace-nowrap"
        >
          Schedule
        </TabsTrigger>
        <TabsTrigger 
          value="review" 
          onClick={() => currentStep !== "review" && isStepAvailable.review && setStep("review")} 
          className="text-xs md:text-sm px-3 py-2 whitespace-nowrap"
        >
          Review
        </TabsTrigger>
      </TabsList>
    </ScrollArea>
  );
};
