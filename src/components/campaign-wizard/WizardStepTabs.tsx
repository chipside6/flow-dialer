
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WizardStep } from "./types";
import { FileText, Users, Radio, PhoneForwarded, CalendarClock, ClipboardCheck, Server } from "lucide-react";

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
  const steps = [
    { id: "basics", label: "Basics", icon: <FileText className="h-4 w-4" /> },
    { id: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
    { id: "audio", label: "Audio", icon: <Radio className="h-4 w-4" /> },
    { id: "transfers", label: "Transfers", icon: <PhoneForwarded className="h-4 w-4" /> },
    { id: "sipProvider", label: "SIP Provider", icon: <Server className="h-4 w-4" /> },
    { id: "schedule", label: "Schedule", icon: <CalendarClock className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <ClipboardCheck className="h-4 w-4" /> }
  ];

  return (
    <TabsList className="grid grid-cols-7 mb-6 max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
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
          className={`flex flex-col items-center justify-center py-2 px-1 sm:px-3 ${
            currentStep === step.id
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground"
          } ${!isStepAvailable[step.id as WizardStep] ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="flex items-center justify-center mb-1">
            {step.icon}
          </span>
          <span className="text-xs truncate max-w-full">{step.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
