
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const InstructionsContent: React.FC = () => {
  return (
    <Alert variant="default">
      <AlertTitle>Installation Instructions for Supabase Configuration</AlertTitle>
      <AlertDescription>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Generate the master configuration using the button on the "Master Configuration" tab</li>
          <li>Copy the generated configuration or download it as a file</li>
          <li>On your Asterisk server, save the configuration to <code>/etc/asterisk/extensions.conf</code> (or include it in your existing file)</li>
          <li>Create a directory for dynamic SIP trunks: <code>mkdir -p /etc/asterisk/dynamic_sip_trunks</code></li>
          <li>Install jq for JSON parsing: <code>apt-get install jq</code></li>
          <li>Verify that your Supabase anon key is correctly included in the configuration</li>
          <li>Reload the dialplan with: <code>asterisk -rx "dialplan reload"</code></li>
          <li>Create Row Level Security policies in Supabase that allow public read access to your campaigns table with these fields:
            <ul className="list-disc pl-5 mt-1">
              <li><code>id</code></li>
              <li><code>greeting_file_url</code></li>
              <li><code>transfer_number</code></li>
            </ul>
          </li>
        </ol>
      </AlertDescription>
    </Alert>
  );
};
