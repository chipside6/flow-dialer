
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignData } from "./types";
import { TransferNumber } from "@/types/transferNumber";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TransferNumberStepProps {
  campaign: CampaignData;
  transferNumbers: TransferNumber[];
  isLoading: boolean;
  onSelectChange: (name: string, value: string) => void;
}

export const TransferNumberStep: React.FC<TransferNumberStepProps> = ({
  campaign,
  transferNumbers,
  isLoading,
  onSelectChange
}) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="transfer_number_id">Select Transfer Number</Label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          value={campaign.transfer_number_id || ""}
          onValueChange={value => onSelectChange("transfer_number_id", value)}
          disabled={transferNumbers.length === 0}
        >
          <SelectTrigger id="transfer_number_id" className="w-full bg-white dark:bg-gray-800">
            <SelectValue placeholder="Choose a transfer number" />
          </SelectTrigger>
          <SelectContent>
            {transferNumbers.length === 0 ? (
              <SelectItem value="empty" disabled>
                No transfer numbers available
              </SelectItem>
            ) : (
              transferNumbers.map(num => (
                <SelectItem key={num.id} value={num.id}>
                  {num.name} ({num.phone_number})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
      {transferNumbers.length === 0 && !isLoading && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have no transfer numbers. Please add one in the Transfer Numbers section first.
          </AlertDescription>
        </Alert>
      )}
      <p className="text-muted-foreground text-xs mt-2">
        The selected number will be used for “Press-1” call transfers in your campaign.
      </p>
    </div>
  );
};
