
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, Code } from "lucide-react";

interface CorsInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CorsInstructionsDialog: React.FC<CorsInstructionsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const corsConfig = `[general]
cors_enable=yes
cors_allow_origin=*
cors_allow_methods=GET, POST, PUT, DELETE, OPTIONS
cors_allow_headers=Content-Type, Authorization
`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuring CORS for Asterisk</DialogTitle>
          <DialogDescription>
            To allow web browsers to connect to your Asterisk server, you need to configure CORS settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200 flex">
            <AlertCircle className="text-amber-500 h-5 w-5 mt-1 mr-3 shrink-0" />
            <div>
              <p className="text-sm text-amber-800">
                CORS (Cross-Origin Resource Sharing) restrictions prevent web applications from making requests to a different domain than the one that served the web page.
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Steps to configure CORS in Asterisk:</h3>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>SSH into your Asterisk server</li>
            <li>Edit the HTTP configuration file: <code>sudo nano /etc/asterisk/http.conf</code></li>
            <li>Add the following configuration:</li>
          </ol>

          <div className="relative bg-slate-900 text-slate-50 p-4 rounded-md">
            <pre className="text-sm overflow-x-auto">{corsConfig}</pre>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2 h-8 w-8 text-slate-200 hover:text-white"
              onClick={() => handleCopy(corsConfig)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <ol className="list-decimal pl-5 space-y-2" start={4}>
            <li>Save the file and exit the editor</li>
            <li>Restart Asterisk: <code>sudo systemctl restart asterisk</code></li>
          </ol>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Security Note:</strong> Using <code>cors_allow_origin=*</code> allows any website to connect to your Asterisk server. In production, restrict this to specific domains for better security.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
