
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileCode, Terminal } from "lucide-react";

export const InstructionsContent = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>One-Time Server Setup</AlertTitle>
        <AlertDescription>
          This configuration only needs to be installed once on your Asterisk server.
          After installation, it will automatically handle all your users and campaigns.
        </AlertDescription>
      </Alert>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-lg">Configuration File Setup</h3>
        </div>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Generate the master configuration from the Master Configuration tab
          </li>
          <li>
            Save the configuration to <code className="bg-gray-100 px-1 rounded">/etc/asterisk/campaign-master.conf</code> on your Asterisk server
          </li>
          <li>
            Add this line to your <code className="bg-gray-100 px-1 rounded">/etc/asterisk/extensions.conf</code> file:
            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">
              #include "campaign-master.conf"
            </pre>
          </li>
          <li>
            Create a directory for dynamic SIP trunk configurations:
            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">
              mkdir -p /etc/asterisk/dynamic_sip_trunks
            </pre>
          </li>
        </ol>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-green-600" />
          <h3 className="font-medium text-lg">Required Packages</h3>
        </div>
        <p>
          Make sure these utilities are installed on your Asterisk server:
        </p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          apt-get install -y jq curl
        </pre>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium text-lg">Reload Configuration</h3>
        </div>
        <p>
          After saving the configuration file, reload Asterisk's dialplan:
        </p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          asterisk -rx "dialplan reload"
        </pre>

        <Alert className="mt-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Verify Installation</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p>Confirm that your configuration was loaded properly:</p>
            <pre className="bg-blue-100 p-2 rounded mt-1 text-sm overflow-x-auto text-blue-800">
              asterisk -rx "dialplan show user-campaign-router"
            </pre>
            <p className="mt-2">You should see the dialplan for the user-campaign-router context. If not, check that:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>The file is in the correct location</li>
              <li>You included it in extensions.conf</li>
              <li>You reloaded the dialplan</li>
              <li>Try restarting Asterisk: <code className="bg-blue-100 px-1 rounded">systemctl restart asterisk</code></li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-orange-600" />
          <h3 className="font-medium text-lg">Recommended: Add Maintenance Schedule</h3>
        </div>
        <p>
          Set up a cron job to periodically clean up temporary files:
        </p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          # Add to /etc/crontab:
0 2 * * * asterisk /usr/sbin/asterisk -rx "dialplan reload" && /usr/sbin/asterisk -rx "originate Local/s@system-maintenance extension s@system-maintenance"
        </pre>
      </div>
    </div>
  );
};
