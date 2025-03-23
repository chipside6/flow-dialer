import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignData } from "./types";
import { GreetingFile } from "@/hooks/useGreetingFiles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AudioStepProps {
  campaign: CampaignData;
  greetingFiles: GreetingFile[];
  onSelectChange: (field: string, value: string) => void;
}

export const AudioStep = ({ campaign, greetingFiles, onSelectChange }: AudioStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <label htmlFor="greetingFile">Greeting Audio:</label>
            <Select onValueChange={(value) => onSelectChange("greetingFileId", value)} defaultValue={campaign.greetingFileId}>
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select a greeting audio" />
              </SelectTrigger>
              <SelectContent>
                {greetingFiles.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    {file.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
