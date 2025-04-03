
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, TestTube } from "lucide-react";

interface GenerateConfigButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export const GenerateConfigButton: React.FC<GenerateConfigButtonProps> = ({
  onGenerate,
  isGenerating
}) => {
  return (
    <Button 
      onClick={onGenerate} 
      disabled={isGenerating}
      className="flex items-center gap-2 active:scale-95 transition-transform"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <TestTube className="h-4 w-4" />
      )}
      Generate Configuration
    </Button>
  );
};
