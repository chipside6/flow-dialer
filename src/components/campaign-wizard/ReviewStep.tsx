import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignData } from "./types";
import type { ContactList } from "@/hooks/useContactLists";
import type { GreetingFile } from "@/hooks/useGreetingFiles";

interface ReviewStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  greetingFiles: GreetingFile[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ campaign, contactLists, greetingFiles }) => {

  // Helper function to find contact list name by ID
  const getContactListName = (id: string | undefined): string => {
    const contactList = contactLists?.find((list) => list.id === id);
    return contactList ? contactList.name : "Not Selected";
  };

  // Helper function to find greeting file name by ID
  const getGreetingFileName = (id: string | undefined): string => {
    const greetingFile = greetingFiles?.find((file) => file.id === id);
    return greetingFile ? greetingFile.filename : "Not Selected";
  };

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Campaign Details Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Campaign Title and Description */}
            <div>
              <h2 className="text-lg font-semibold">Basics</h2>
              <div className="pl-2">
                <p>
                  <strong>Title:</strong> {campaign.title || "N/A"}
                </p>
                <p>
                  <strong>Description:</strong> {campaign.description || "N/A"}
                </p>
              </div>
            </div>

            {/* Contact List */}
            <div>
              <h2 className="text-lg font-semibold">Contacts</h2>
              <div className="pl-2">
                <p>
                  <strong>Contact List:</strong> {getContactListName(campaign.contactListId)}
                </p>
              </div>
            </div>

            {/* Audio */}
            <div>
              <h2 className="text-lg font-semibold">Audio</h2>
              <div className="pl-2">
                <p>
                  <strong>Greeting File:</strong> {getGreetingFileName(campaign.greetingFileId)}
                </p>
              </div>
            </div>

            {/* Transfer Number */}
            <div>
              <h2 className="text-lg font-semibold">Transfers</h2>
              <div className="pl-2">
                <p>
                  <strong>Transfer Number:</strong> {campaign.transferNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* SIP Provider */}
            <div>
              <h2 className="text-lg font-semibold">SIP Provider</h2>
              <div className="pl-2">
                <p>
                  <strong>SIP Provider ID:</strong> {campaign.sipProviderId || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
