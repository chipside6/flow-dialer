
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { WizardStep } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <div className="flex justify-between w-full gap-4">
      {step !== "basics" ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious} 
          className="px-4 py-2.5 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> 
          <span>Previous</span>
        </Button>
      ) : (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="px-4 py-2.5 h-auto"
        >
          <X className="h-4 w-4 mr-2" />
          <span>Cancel</span>
        </Button>
      )}
      
      {step !== "review" ? (
        <Button 
          type="button" 
          onClick={onNext} 
          className="px-4 py-2.5 h-auto"
        >
          <span>Next</span> 
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button 
          type="button" 
          className="px-4 py-2.5 h-auto bg-green-600 hover:bg-green-700 text-white" 
          onClick={onComplete}
        >
          <Check className="h-4 w-4 mr-2" /> 
          <span>{isMobile ? "Create" : "Create Campaign"}</span>
        </Button>
      )}
    </div>
  );
};
