
import React from 'react';

export const SetupInstructions = () => {
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-medium mb-4">How to Configure Your GoIP Device</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">1. Access Your GoIP Web Interface</h4>
          <p className="text-sm text-muted-foreground">
            Open a web browser and navigate to your GoIP device's IP address.
            Login with your admin credentials (default is usually admin/admin).
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">2. Navigate to SIP Settings</h4>
          <p className="text-sm text-muted-foreground">
            Find the SIP configuration section in your GoIP device's web interface.
            This is typically under "Configuration" → "SIP" or similar.
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">3. Enter SIP Credentials</h4>
          <p className="text-sm text-muted-foreground">
            Enter the SIP details exactly as shown in the table above:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>SIP Server: Enter the SIP server address shown above</li>
            <li>Port: 5060 (default SIP port)</li>
            <li>Username: Enter the SIP username shown above</li>
            <li>Password: Enter the SIP password shown above</li>
            <li>Authentication ID: Same as username</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">4. Save Changes and Restart</h4>
          <p className="text-sm text-muted-foreground">
            Save your configuration changes and restart the GoIP device if required.
            After restarting, the device should register with our SIP server.
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">5. Test the Connection</h4>
          <p className="text-sm text-muted-foreground">
            You can verify the connection status in your campaign dashboard.
            If everything is set up correctly, you should see a "Connected" status.
          </p>
        </div>
      </div>
    </div>
  );
};
