
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CampaignData } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TransfersStep = ({ campaign, onChange }: TransfersStepProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="transferNumber">Transfer Number</Label>
        <Input
          id="transferNumber"
          name="transferNumber"
          value={campaign.transferNumber}
          onChange={onChange}
          placeholder={isMobile ? "Phone for transfers" : "Enter a phone number for transfers (e.g., +1 555-123-4567)"}
        />
        <p className="text-sm text-muted-foreground mt-1">
          {isMobile 
            ? "Number for transferring calls" 
            : "This is the number that will receive calls when recipients request to speak with someone."}
        </p>
      </div>
    </div>
  );
};
