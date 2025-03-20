
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { WizardStep } from "./types";

interface WizardNavigationProps {
  step: WizardStep;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onComplete: () => void;
}

export const WizardNavigation = ({ 
  step, 
  onPrevious, 
  onNext, 
  onCancel,
  onComplete 
}: WizardNavigationProps) => {
  return (
    <div className="flex justify-between w-full gap-2">
      {step !== "basics" ? (
        <Button type="button" variant="outline" onClick={onPrevious} className="flex-1 md:flex-initial">
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 md:flex-initial">
          Cancel
        </Button>
      )}
      
      {step !== "review" ? (
        <Button type="button" onClick={onNext} className="flex-1 md:flex-initial">
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button type="button" className="bg-green-600 hover:bg-green-700 flex-1 md:flex-initial" onClick={onComplete}>
          <Check className="h-4 w-4 mr-2" /> Create Campaign
        </Button>
      )}
    </div>
  );
};
