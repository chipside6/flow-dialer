
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignData, ContactList, GreetingFile } from "./types";
import { SipProvider } from "@/types/sipProviders";
import { useSipProviders } from "@/hooks/useSipProviders";

interface ReviewStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  greetingFiles: GreetingFile[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ campaign, contactLists, greetingFiles }) => {
  const { providers } = useSipProviders();
  
  // Find the selected contact list, greeting file, and SIP provider
  const selectedList = contactLists.find(list => list.id === campaign.contactListId);
  const selectedGreeting = greetingFiles.find(file => file.id === campaign.greetingFileId);
  const selectedProvider = providers.find(provider => provider.id === campaign.sipProviderId);
  
  const sections = [
    {
      title: "Campaign Basics",
      items: [
        { label: "Campaign Name", value: campaign.title || "Not specified" },
        { label: "Description", value: campaign.description || "No description" }
      ]
    },
    {
      title: "Contact List",
      items: [
        { label: "Selected List", value: selectedList?.name || "No list selected" }
      ]
    },
    {
      title: "Audio Greeting",
      items: [
        { label: "Selected Greeting", value: selectedGreeting?.filename || "No greeting selected" }
      ]
    },
    {
      title: "Transfer Number",
      items: [
        { label: "Transfer To", value: campaign.transferNumber || "No transfer number specified" }
      ]
    },
    {
      title: "SIP Provider",
      items: [
        { label: "Provider", value: selectedProvider?.name || "No provider selected" },
        { label: "Host", value: selectedProvider?.host || "Not specified" },
        { label: "Port", value: selectedProvider?.port || "Not specified" }
      ]
    },
    {
      title: "Schedule",
      items: [
        { label: "Start Date", value: campaign.schedule.startDate || "Not specified" },
        { label: "Concurrent Calls", value: "1" }
      ]
    }
  ];
  
  return (
    <Card>
      <CardContent className="pt-6 pb-8 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Review Campaign Details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please review your campaign details before creating it.
          </p>
        </div>
        
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="font-medium text-sm border-b pb-1">{section.title}</h4>
              <div className="grid gap-y-2">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-muted-foreground col-span-1">{item.label}:</span>
                    <span className="text-sm font-medium col-span-2">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
