
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ConfigOutputProps {
  configOutput: string;
}

export const ConfigOutput: React.FC<ConfigOutputProps> = ({ configOutput }) => {
  const [copyingToClipboard, setCopyingToClipboard] = React.useState(false);

  if (!configOutput) return null;

  const handleCopyConfig = () => {
    setCopyingToClipboard(true);
    try {
      navigator.clipboard.writeText(configOutput);
      toast({
        title: "Copied to Clipboard",
        description: "Configuration has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: `Could not copy to clipboard: ${error.message}`,
        variant: "destructive"
      });
    }
    setTimeout(() => setCopyingToClipboard(false), 1000);
  };

  return (
    <div className="space-y-2 pt-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="config-output">Configuration Output</Label>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCopyConfig}
          className="active:scale-95 transition-transform"
          disabled={copyingToClipboard}
        >
          {copyingToClipboard ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copyingToClipboard ? "Copied!" : "Copy to Clipboard"}
        </Button>
      </div>
      <Textarea
        id="config-output"
        value={configOutput}
        readOnly
        rows={15}
        className="font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      />
      
      <div className="bg-muted p-4 rounded-md mt-2">
        <h4 className="text-sm font-medium mb-1">How to use this configuration</h4>
        <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
          <li>Copy the SIP Provider section to your pjsip.conf or sip.conf file</li>
          <li>Copy the Dialplan section to your extensions.conf file</li>
          <li>Replace the placeholders with your actual greeting file path and transfer number</li>
          <li>Reload Asterisk with: <code className="bg-muted-foreground/20 px-1 rounded">asterisk -rx "core reload"</code></li>
        </ol>
      </div>
    </div>
  );
};
