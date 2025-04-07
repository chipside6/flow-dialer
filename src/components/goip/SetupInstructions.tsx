
import React from 'react';
import { Smartphone, Info } from 'lucide-react';
import { ASTERISK_CONFIG } from '@/config/productionConfig';

export const SetupInstructions = () => {
  const asteriskIp = ASTERISK_CONFIG.apiUrl.split(':')[0];

  return (
    <div className="mt-6 p-5 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-medium mb-2 flex items-center">
          <Smartphone className="h-4 w-4 mr-2" />
          GoIP Setup Instructions
        </h4>
        <p className="text-sm">
          To set up your GoIP device, login to its web interface at http://192.168.8.1. For each port, enter the SIP Server: {asteriskIp}, and use the username/password listed above. Then save and reboot your device.
        </p>
      </div>
    </div>
  );
};
