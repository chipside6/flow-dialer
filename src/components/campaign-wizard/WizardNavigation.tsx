
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
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
    <div className="flex justify-between w-full gap-4">
      {step !== "basics" ? (
        <Button type="button" variant="outline" onClick={onPrevious} className="px-4 py-2.5 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2.5" /> Previous
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2.5 h-auto">
          Cancel
        </Button>
      )}
      
      {step !== "review" ? (
        <Button type="button" onClick={onNext} className="px-4 py-2.5 h-auto">
          Next <ArrowRight className="h-4 w-4 ml-2.5" />
        </Button>
      ) : (
        <Button 
          type="button" 
          variant="success"
          className="px-4 py-2.5 h-auto" 
          onClick={onComplete}
        >
          <Check className="h-4 w-4 mr-2.5" /> Create Campaign
        </Button>
      )}
    </div>
  );
};
