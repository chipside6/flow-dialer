
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TransfersStep = ({ campaign, onChange }: TransfersStepProps) => {
  const { user } = useAuth();
  const { 
    transferNumbers, 
    isLoading 
  } = useTransferNumbers();

  const handleSelectTransferNumber = (value: string) => {
    // Create a synthetic event object to pass to onChange
    const syntheticEvent = {
      target: {
        name: "transferNumber",
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="transferNumber">Transfer Number</Label>
        {isLoading ? (
          <div className="flex items-center mt-2">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading transfer numbers...</span>
          </div>
        ) : transferNumbers.length > 0 ? (
          <Select
            value={campaign.transferNumber}
            onValueChange={handleSelectTransferNumber}
          >
            <SelectTrigger id="transferNumber">
              <SelectValue placeholder="Select a transfer number" />
            </SelectTrigger>
            <SelectContent>
              {transferNumbers.map((tn) => (
                <SelectItem key={tn.id} value={tn.number}>
                  {tn.name} ({tn.number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="transferNumber"
            name="transferNumber"
            value={campaign.transferNumber}
            onChange={onChange}
            placeholder="Enter a phone number for transfers (e.g., +1 555-123-4567)"
          />
        )}
        <p className="text-sm text-muted-foreground mt-1">
          This is the number that will receive calls when recipients request to speak with someone.
        </p>
      </div>
    </div>
  );
};
