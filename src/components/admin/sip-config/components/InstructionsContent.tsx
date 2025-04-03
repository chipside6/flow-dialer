
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const InstructionsContent: React.FC = () => {
  return (
    <Alert variant="default">
      <AlertTitle>Installation Instructions</AlertTitle>
      <AlertDescription>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Generate the master configuration using the button on the "Master Configuration" tab</li>
          <li>Copy the generated configuration or download it as a file</li>
          <li>On your Asterisk server, save the configuration to <code>/etc/asterisk/extensions.conf</code> (or include it in your existing file)</li>
          <li>Reload the dialplan with: <code>asterisk -rx "dialplan reload"</code></li>
          <li>User campaigns will now automatically work without additional configuration</li>
        </ol>
      </AlertDescription>
    </Alert>
  );
};
