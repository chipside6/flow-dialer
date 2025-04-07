
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampaignData } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange?: (name: string, value: string | number) => void;
}

export const TransfersStep: React.FC<TransfersStepProps> = ({ 
  campaign, 
  onChange,
  onSelectChange 
}) => {
  // Available ports for GoIP (typically 1-4 for a 4-port GoIP)
  const availablePorts = [1, 2, 3, 4];
  
  const handlePortChange = (value: string) => {
    if (onSelectChange) {
      onSelectChange('portNumber', parseInt(value));
    }
  };
  
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
              This is the phone number where live calls will be transferred.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portNumber">GoIP Port</Label>
            <Select 
              value={campaign.portNumber?.toString() || "1"} 
              onValueChange={handlePortChange}
            >
              <SelectTrigger id="portNumber">
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.map(port => (
                  <SelectItem key={port} value={port.toString()}>
                    Port {port}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select which GoIP port to use for dialing out.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
