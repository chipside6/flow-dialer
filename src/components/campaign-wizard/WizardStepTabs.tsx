
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WizardStep } from "./types";
import { FileText, Users, Radio, PhoneForwarded, ClipboardCheck } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface WizardStepTabsProps {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  isStepAvailable: Record<WizardStep, boolean>;
}

export const WizardStepTabs: React.FC<WizardStepTabsProps> = ({
  currentStep,
  setStep,
  isStepAvailable
}) => {
  const isMobile = useIsMobile();
  
  const steps = [
    { id: "basics", label: "Basics", icon: <FileText className="h-4 w-4" /> },
    { id: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
    { id: "audio", label: "Audio", icon: <Radio className="h-4 w-4" /> },
    { id: "transfers", label: "Transfers", icon: <PhoneForwarded className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <ClipboardCheck className="h-4 w-4" /> }
  ];

  return (
    <div className="wizard-tabs-container w-full overflow-x-auto">
      <ScrollArea className="w-full">
        <TabsList className="mb-4 mx-auto flex min-w-full justify-start sm:justify-center no-vertical-scroll">
          {steps.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              onClick={() => {
                if (isStepAvailable[step.id as WizardStep]) {
                  setStep(step.id as WizardStep);
                }
              }}
              disabled={!isStepAvailable[step.id as WizardStep]}
              className={`flex-shrink-0 flex flex-col items-center justify-center py-2 px-2 sm:px-3 ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground"
              } ${!isStepAvailable[step.id as WizardStep] ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="flex items-center justify-center mb-1">
                {step.icon}
              </span>
              <span className="text-xs truncate max-w-[70px] sm:max-w-full">
                {isMobile && step.id === "transfers" ? "Transfer" : step.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
