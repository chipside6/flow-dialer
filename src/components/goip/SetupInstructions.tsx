
import React from 'react';
import { Smartphone } from 'lucide-react';
import { ASTERISK_CONFIG } from '@/config/productionConfig';

export const SetupInstructions = () => {
  const asteriskIp = ASTERISK_CONFIG.apiUrl.split(':')[0]; // Extract just the IP part

  return (
    <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-md">
      <h4 className="font-medium mb-2 flex items-center">
        <Smartphone className="h-4 w-4 mr-2" />
        GoIP Setup Instructions
      </h4>
      <p>
        To set up your GoIP device, login to its web interface at http://192.168.8.1. For each port, enter the SIP Server: {asteriskIp}, and use the username/password listed above. Then save and reboot your device.
      </p>
    </div>
  );
};
