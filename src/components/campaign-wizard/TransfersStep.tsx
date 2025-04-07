
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampaignData } from "./types";

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TransfersStep: React.FC<TransfersStepProps> = ({ 
  campaign, 
  onChange
}) => {
  return (
    <Card>
      <CardContent className="pt-6 pb-8 space-y-5">
        <div>
          <h3 className="text-lg font-medium">Transfer Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure where calls should be transferred when a prospect responds.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transferNumber">Transfer Number</Label>
            <Input
              id="transferNumber"
              name="transferNumber"
              placeholder="e.g. +1 (555) 123-4567"
              value={campaign.transferNumber}
              onChange={onChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This is the phone number where live calls will be transferred when answered.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
