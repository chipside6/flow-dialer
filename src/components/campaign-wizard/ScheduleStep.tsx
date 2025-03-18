
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";

interface ScheduleStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export const ScheduleStep = ({ campaign, onChange, onSelectChange }: ScheduleStepProps) => {
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
      
      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          value={campaign.schedule.timezone}
          onValueChange={(value) => onSelectChange("timezone", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="maxConcurrentCalls">Max Concurrent Calls</Label>
        <Input
          id="maxConcurrentCalls"
          name="maxConcurrentCalls"
          type="number"
          min={1}
          max={50}
          value={campaign.schedule.maxConcurrentCalls}
          onChange={onChange}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Maximum number of simultaneous calls (1-50)
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
