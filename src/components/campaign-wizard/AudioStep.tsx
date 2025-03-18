
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData, GreetingFile } from "./types";

interface AudioStepProps {
  campaign: CampaignData;
  greetingFiles: GreetingFile[];
  onSelectChange: (name: string, value: string) => void;
}

export const AudioStep = ({ campaign, greetingFiles, onSelectChange }: AudioStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="greetingFileId">Select Greeting Audio</Label>
        <Select
          value={campaign.greetingFileId}
          onValueChange={(value) => onSelectChange("greetingFileId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a greeting audio file" />
          </SelectTrigger>
          <SelectContent>
            {greetingFiles.map(file => (
              <SelectItem key={file.id} value={file.id}>{file.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
