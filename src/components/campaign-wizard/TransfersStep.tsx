
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Info, ArrowRight } from "lucide-react";
import { CampaignData } from './types';
import { TransferNumberSelector } from '../dialer/TransferNumberSelector';

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string | number) => void;
}

export const TransfersStep: React.FC<TransfersStepProps> = ({
  campaign,
  onChange,
  onSelectChange
}) => {
  // Handle transfer number selection
  const handleTransferNumberSelect = (transferNumber: string) => {
    onSelectChange('transferNumber', transferNumber);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Transfer Settings</CardTitle>
          <CardDescription>
            Configure where to transfer calls when recipients press 1 during the call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransferNumberSelector
            campaignId={campaign.id || ''}
            onTransferNumberSelect={handleTransferNumberSelect}
          />

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              <span className="font-medium">How the transfer works:</span>
              <div className="mt-2 flex flex-col space-y-2">
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                  <span className="ml-2">When someone answers your call, they'll hear your greeting message</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                  <span className="ml-2">If they press 1 on their phone keypad, we'll use your GoIP device</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                  <div className="ml-2 flex items-center">
                    <span>To immediately connect them to this number</span>
                    <ArrowRight className="mx-2 h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{campaign.transferNumber || "Your transfer number"}</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <span className="font-semibold">Important:</span> Make sure the transfer number is correct and has someone 
              available to answer transferred calls. The same GoIP port used for the initial call will be used for the 
              transfer, ensuring seamless connectivity.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
