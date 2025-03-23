
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CampaignData } from "./types";

interface ScheduleStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export const ScheduleStep = ({ campaign, onChange }: ScheduleStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={campaign.schedule.startDate}
          onChange={onChange}
        />
        <p className="text-sm text-muted-foreground mt-1">
          When should this campaign begin?
        </p>
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> The campaign will run continuously until all contacts have been called.
        </p>
      </div>
    </div>
  );
};
