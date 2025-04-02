
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignData, ContactList, GreetingFile } from "./types";

interface ReviewStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  greetingFiles: GreetingFile[];
}

export const ReviewStep = ({ campaign, contactLists, greetingFiles }: ReviewStepProps) => {
  // Find the selected contact list and greeting file
  const selectedContactList = contactLists.find(list => list.id === campaign.contactListId);
  const selectedGreetingFile = greetingFiles.find(file => file.id === campaign.greetingFileId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Campaign</h2>
      <p className="text-muted-foreground">
        Please review your campaign details before creating it.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Title:</p>
              <p>{campaign.title}</p>
            </div>
            <div>
              <p className="font-medium">Description:</p>
              <p>{campaign.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact List</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Selected List:</p>
            <p>{selectedContactList?.name || "No contact list selected"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Selected Greeting:</p>
            <p>{selectedGreetingFile?.filename || "No greeting file selected"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Number:</p>
            <p>{campaign.transferNumber || "No transfer number set"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SIP Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Provider ID:</p>
            <p>{campaign.sipProviderId || "No SIP provider selected"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-4 rounded-md">
        <p className="text-sm text-muted-foreground">
          After creation, your campaign will be in a "pending" state. 
          You can then start it from the campaigns dashboard when you're ready.
        </p>
      </div>
    </div>
  );
};
