
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DownloadButtonProps {
  configOutput: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ configOutput }) => {
  const handleDownloadConfig = () => {
    if (!configOutput) {
      toast({
        title: "No Configuration",
        description: "Please generate configuration first before downloading",
        variant: "destructive"
      });
      return;
    }

    // Create a blob with the configuration text
    const blob = new Blob([configOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asterisk-master-config.conf';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Downloaded",
      description: "Asterisk master configuration has been downloaded as a file",
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownloadConfig}
      className="flex items-center"
    >
      <Download className="mr-2 h-4 w-4" />
      Download Config
    </Button>
  );
};
