
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Server } from "lucide-react";

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
      className="w-full"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Generate Master Configuration'
      )}
    </Button>
  );
};
