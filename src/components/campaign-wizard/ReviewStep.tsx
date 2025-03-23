
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignData, ContactList } from "./types";
import { GreetingFile } from "@/hooks/useGreetingFiles";

interface ReviewStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  greetingFiles: GreetingFile[];
}

export const ReviewStep = ({ campaign, contactLists, greetingFiles }: ReviewStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Campaign Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Campaign Details</h3>
            <p><span className="text-muted-foreground">Title:</span> {campaign.title}</p>
            <p><span className="text-muted-foreground">Description:</span> {campaign.description || "None provided"}</p>
          </div>
          <div>
            <h3 className="font-medium">Contact List</h3>
            <p>{contactLists.find(list => list.id === campaign.contactListId)?.name || "None selected"}</p>
          </div>
          <div>
            <h3 className="font-medium">Greeting Audio</h3>
            <p>{greetingFiles.find(file => file.id === campaign.greetingFileId)?.filename || "None selected"}</p>
          </div>
          <div>
            <h3 className="font-medium">Transfer Number</h3>
            <p>{campaign.transferNumber}</p>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Schedule</h3>
          <p>
            Start Date: {campaign.schedule.startDate}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            The campaign will run until all contacts have been called.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
