
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, PhoneIcon } from "lucide-react";
import { CampaignData } from './types';

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
  // Basic phone number validation regex - can be enhanced for specific requirements
  const isValidPhoneNumber = (phone: string) => {
    // Allow +, spaces, dashes, and numbers
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any characters that aren't numbers, +, (, ), -, or spaces
    const sanitizedValue = e.target.value.replace(/[^\d\+\(\)\-\s]/g, '');
    
    // Create a synthetic event with the sanitized value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: sanitizedValue
      }
    };
    
    onChange(syntheticEvent);
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
          <div>
            <Label htmlFor="transferNumber" className="text-base font-medium">
              Transfer Number
            </Label>
            <div className="mt-2 relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="transferNumber"
                name="transferNumber"
                value={campaign.transferNumber}
                onChange={handlePhoneChange}
                placeholder="+1 (555) 123-4567"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter the full phone number where calls will be transferred when someone presses 1
            </p>
          </div>

          {campaign.transferNumber && !isValidPhoneNumber(campaign.transferNumber) && (
            <Alert variant="destructive">
              <AlertDescription>
                Please enter a valid phone number including country code if needed
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              When someone answers your call and presses 1, they will be immediately transferred to this number.
              <br />
              Make sure the number is correct and has someone available to answer transferred calls.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
