
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CampaignData } from "./types";

interface BasicsStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const BasicsStep = ({ campaign, onChange }: BasicsStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Campaign Title</Label>
        <Input
          id="title"
          name="title"
          value={campaign.title}
          onChange={onChange}
          placeholder="Enter a title for your campaign"
        />
      </div>
      <div>
        <Label htmlFor="description">Campaign Description</Label>
        <Textarea
          id="description"
          name="description"
          value={campaign.description}
          onChange={onChange}
          placeholder="Describe the purpose of this campaign"
          rows={3}
        />
      </div>
    </div>
  );
};
