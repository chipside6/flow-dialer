
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ConfigOutputProps {
  configOutput: string;
}

export const ConfigOutput: React.FC<ConfigOutputProps> = ({ configOutput }) => {
  if (!configOutput) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(configOutput)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Configuration copied to clipboard",
        });
      })
      .catch(err => {
        console.error("Failed to copy configuration:", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard. Please try selecting and copying manually.",
          variant: "destructive"
        });
      });
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy} 
          className="h-8 gap-1"
          title="Copy to clipboard"
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Copy</span>
        </Button>
      </div>
      <Textarea
        className="font-mono text-sm h-80 p-4 resize-y overflow-auto"
        readOnly
        value={configOutput}
      />
    </div>
  );
};
