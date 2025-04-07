
import React from "react";
import { CampaignData, ContactList, GreetingFile } from "./types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ReviewStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  greetingFiles: GreetingFile[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ campaign, contactLists, greetingFiles }) => {
  // Find the selected contact list name
  const selectedContactList = contactLists.find(list => list.id === campaign.contactListId);
  
  // Find the selected greeting file name
  const selectedGreetingFile = greetingFiles.find(file => file.id === campaign.greetingFileId);
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Review Campaign Details</h3>
        <p className="text-sm text-muted-foreground">
          Please review your campaign details before creating
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Campaign Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sm font-medium">Title:</span>
            <span className="text-sm col-span-2">{campaign.title || "Untitled Campaign"}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sm font-medium">Description:</span>
            <span className="text-sm col-span-2">{campaign.description || "No description"}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Contact List</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-sm">
            {selectedContactList?.name || "No contact list selected"}
          </span>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Greeting Audio</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-sm">
            {selectedGreetingFile?.filename || "No greeting file selected"}
          </span>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transfer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sm font-medium">Transfer To:</span>
            <span className="text-sm col-span-2">{campaign.transferNumber || "Not set"}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sm font-medium">GoIP Port:</span>
            <span className="text-sm col-span-2">Port {campaign.portNumber || 1}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sm font-medium">Start Date:</span>
            <span className="text-sm col-span-2">{campaign.schedule.startDate || "Not set"}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sm font-medium">Concurrent Calls:</span>
            <span className="text-sm col-span-2">1</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
