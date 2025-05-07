
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info } from "lucide-react";

interface CorsInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CorsInstructionsDialog: React.FC<CorsInstructionsDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuring CORS for Asterisk</DialogTitle>
          <DialogDescription>
            Follow these steps to configure CORS on your Asterisk server
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Step 1: Edit http.conf</h3>
          <p>SSH into your Asterisk server and edit the http.conf file:</p>
          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto text-xs">
            sudo nano /etc/asterisk/http.conf
          </pre>
          
          <h3 className="font-medium text-lg">Step 2: Add CORS Headers</h3>
          <p>Add or modify these lines in the [general] section:</p>
          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto text-xs">
{`[general]
enabled=yes
bindaddr=0.0.0.0   ; Allow connections from any IP address
bindport=8088
tlsenable=no

; CORS configuration
cors_origin_policy=all
cors_access_control_allow_origin=*
cors_access_control_allow_methods=*
cors_access_control_allow_headers=*
cors_access_control_max_age=1728000`}
          </pre>
          
          <h3 className="font-medium text-lg">Step 3: Reload Asterisk HTTP Server</h3>
          <p>After saving the changes, reload the Asterisk HTTP server with these commands:</p>
          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto text-xs">
            sudo asterisk -rx "module reload res_http_websocket.so"<br/>
            sudo asterisk -rx "module reload res_http_server.so"
          </pre>
          
          <h3 className="font-medium text-lg">Step 4: Verify Configuration</h3>
          <p>Check that the HTTP server is running with the correct settings:</p>
          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto text-xs">
            sudo asterisk -rx "http show status"
          </pre>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              After making these changes, try testing the connection again. If you're still having issues, you may need to restart the Asterisk server completely with <code>sudo systemctl restart asterisk</code>.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
