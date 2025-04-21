
import React from "react";
import { CampaignData } from "./types";
import { ContactList } from "./types";
import { GreetingFile } from "@/hooks/useGreetingFiles";
import { TransferNumber } from "@/types/transferNumber";

interface ReviewStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  greetingFiles: GreetingFile[];
  transferNumbers?: TransferNumber[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  campaign,
  contactLists,
  greetingFiles,
  transferNumbers = [],
}) => {
  // Find selected transfer number
  const transferNumber = transferNumbers.find(
    (t) => t.id === campaign.transfer_number_id
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Review Campaign Details</h2>
      <div>
        <strong>Title:</strong> {campaign.title}
      </div>
      <div>
        <strong>Description:</strong> {campaign.description}
      </div>
      <div>
        <strong>Contact List:</strong>{" "}
        {contactLists.find((l) => l.id === campaign.contactListId)?.name ||
          "N/A"}
      </div>
      <div>
        <strong>Greeting Audio:</strong>{" "}
        {greetingFiles.find((f) => f.id === campaign.greetingFileId)?.filename ||
          "N/A"}
      </div>
      <div>
        <strong>Transfer Number:</strong>{" "}
        {transferNumber
          ? `${transferNumber.name} (${transferNumber.number})`
          : "N/A"}
      </div>
    </div>
  );
};
