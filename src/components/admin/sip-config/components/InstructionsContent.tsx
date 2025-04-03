
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileCode, Terminal, Info, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const InstructionsContent = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
        
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <strong>Generate the master configuration</strong> from the Master Configuration tab
          </li>
          <li>
            <strong>Create the configuration file</strong> on your Asterisk server:
            <div className="bg-gray-100 p-3 rounded mt-2 text-sm relative">
              <pre className="overflow-x-auto">sudo nano /etc/asterisk/campaign-master.conf</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard("sudo nano /etc/asterisk/campaign-master.conf")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Paste the generated configuration and save (Ctrl+O, Enter, Ctrl+X)
            </p>
          </li>
          <li>
            <strong>Include the file in your extensions.conf</strong>:
            <div className="bg-gray-100 p-3 rounded mt-2 text-sm relative">
              <pre className="overflow-x-auto">sudo nano /etc/asterisk/extensions.conf</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard("sudo nano /etc/asterisk/extensions.conf")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Add this line <strong>outside of any context definition blocks</strong>:
            </p>
            <div className="bg-gray-100 p-3 rounded mt-2 text-sm relative">
              <pre className="overflow-x-auto">#include "campaign-master.conf"</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('#include "campaign-master.conf"')}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-md mt-2">
              <p className="text-sm text-amber-800 flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Make sure this line is <strong>NOT</strong> inside any <code className="bg-amber-100 px-1 rounded">[context]</code> block. It should be in the global section of the file.</span>
              </p>
            </div>
          </li>
          <li>
            <strong>Create a directory for dynamic SIP trunk configurations</strong>:
            <div className="bg-gray-100 p-3 rounded mt-2 text-sm relative">
              <pre className="overflow-x-auto">sudo mkdir -p /etc/asterisk/dynamic_sip_trunks</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard("sudo mkdir -p /etc/asterisk/dynamic_sip_trunks")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
          <li>
            <strong>Set proper file permissions</strong> (required for Asterisk to read the files):
            <div className="bg-gray-100 p-3 rounded mt-2 text-sm relative">
              <pre className="overflow-x-auto">sudo chown -R asterisk:asterisk /etc/asterisk/campaign-master.conf
sudo chown -R asterisk:asterisk /etc/asterisk/dynamic_sip_trunks
sudo chmod 644 /etc/asterisk/campaign-master.conf</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard("sudo chown -R asterisk:asterisk /etc/asterisk/campaign-master.conf\nsudo chown -R asterisk:asterisk /etc/asterisk/dynamic_sip_trunks\nsudo chmod 644 /etc/asterisk/campaign-master.conf")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
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
        <div className="bg-gray-100 p-3 rounded text-sm relative">
          <pre className="overflow-x-auto">sudo apt-get install -y jq curl</pre>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-1 right-1 h-6 w-6 p-0" 
            onClick={() => copyToClipboard("sudo apt-get install -y jq curl")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium text-lg">Reload Configuration</h3>
        </div>
        <p>
          After saving all configurations, reload Asterisk's dialplan:
        </p>
        <div className="bg-gray-100 p-3 rounded text-sm relative">
          <pre className="overflow-x-auto">sudo asterisk -rx "dialplan reload"</pre>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-1 right-1 h-6 w-6 p-0" 
            onClick={() => copyToClipboard('sudo asterisk -rx "dialplan reload"')}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Alert className="mt-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Verify Installation</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p>Confirm that your configuration was loaded properly:</p>
            <div className="bg-blue-100 p-3 rounded mt-2 text-sm text-blue-800 relative">
              <pre className="overflow-x-auto">sudo asterisk -rx "dialplan show user-campaign-router"</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo asterisk -rx "dialplan show user-campaign-router"')}
              >
                <Copy className="h-3.5 w-3.5 text-blue-700" />
              </Button>
            </div>
            <p className="mt-2">You should see the dialplan for the user-campaign-router context. If not, check that:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>The file is in the correct location</li>
              <li>You included it in extensions.conf</li>
              <li>You reloaded the dialplan</li>
              <li>Try restarting Asterisk: <code className="bg-blue-100 px-1 rounded">sudo systemctl restart asterisk</code></li>
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
        <div className="bg-gray-100 p-3 rounded text-sm relative">
          <pre className="overflow-x-auto">sudo crontab -e

# Add this line:
0 2 * * * asterisk /usr/sbin/asterisk -rx "dialplan reload" && /usr/sbin/asterisk -rx "originate Local/s@system-maintenance extension s@system-maintenance"</pre>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-1 right-1 h-6 w-6 p-0" 
            onClick={() => copyToClipboard("sudo crontab -e\n\n# Add this line:\n0 2 * * * asterisk /usr/sbin/asterisk -rx \"dialplan reload\" && /usr/sbin/asterisk -rx \"originate Local/s@system-maintenance extension s@system-maintenance\"")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-4 bg-amber-50">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-amber-600" />
          <h3 className="font-medium text-lg">Troubleshooting Guide</h3>
        </div>
        <p className="text-amber-800">
          If <code className="bg-amber-100 px-1 rounded">asterisk -rx "dialplan show user-campaign-router"</code> returns "There is no existence of 'user-campaign-router' context", try these steps:
        </p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-amber-800">1. Verify File Contents</h4>
            <p className="text-amber-700">Make sure the configuration file contains the 'user-campaign-router' context:</p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">sudo grep -A 5 "\[user-campaign-router\]" /etc/asterisk/campaign-master.conf</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo grep -A 5 "\\[user-campaign-router\\]" /etc/asterisk/campaign-master.conf')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
            <p className="text-sm text-amber-700 mt-1">You should see the context definition. If not, regenerate the configuration.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-amber-800">2. Check File Inclusion</h4>
            <p className="text-amber-700">Verify your extensions.conf includes the campaign-master.conf file:</p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">sudo grep "campaign-master.conf" /etc/asterisk/extensions.conf</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo grep "campaign-master.conf" /etc/asterisk/extensions.conf')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              It should show: <code className="bg-amber-100 px-1 rounded">#include "campaign-master.conf"</code>
            </p>
            <p className="text-sm text-amber-700 mt-1">
              <strong>NOTE:</strong> Make sure the include statement is NOT inside another context.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-amber-800">3. Try Direct File Loading</h4>
            <p className="text-amber-700">Try forcing Asterisk to load your config directly:</p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">sudo asterisk -rx "dialplan reload campaign-master.conf"</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo asterisk -rx "dialplan reload campaign-master.conf"')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-amber-800">4. Check For Syntax Errors</h4>
            <p className="text-amber-700">Look for syntax errors in your configuration:</p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">sudo asterisk -C -x "dialplan reload"</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo asterisk -C -x "dialplan reload"')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Also check the Asterisk logs for errors:
            </p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">sudo tail -n 50 /var/log/asterisk/messages</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo tail -n 50 /var/log/asterisk/messages')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-amber-800">5. Full Restart</h4>
            <p className="text-amber-700">As a last resort, try a full restart of Asterisk:</p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">sudo systemctl restart asterisk</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo systemctl restart asterisk')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Then check if the context is now available:
            </p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">sudo asterisk -rx "dialplan show user-campaign-router"</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('sudo asterisk -rx "dialplan show user-campaign-router"')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-amber-800">6. Check File Path Case</h4>
            <p className="text-amber-700">Asterisk can be case-sensitive in some environments. Verify the filename case:</p>
            <div className="bg-amber-100 p-3 rounded text-sm relative">
              <pre className="overflow-x-auto text-amber-800">ls -la /etc/asterisk/campaign-master.conf
ls -la /etc/asterisk/Campaign-Master.conf</pre>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-6 w-6 p-0" 
                onClick={() => copyToClipboard('ls -la /etc/asterisk/campaign-master.conf\nls -la /etc/asterisk/Campaign-Master.conf')}
              >
                <Copy className="h-3.5 w-3.5 text-amber-700" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
