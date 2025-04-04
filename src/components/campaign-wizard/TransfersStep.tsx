
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CampaignData } from "./types";
import { useAuth } from "@/contexts/auth";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TransfersStep = ({ campaign, onChange }: TransfersStepProps) => {
  const { user } = useAuth();
  const { 
    transferNumbers, 
    isLoading,
    error,
    refreshTransferNumbers
  } = useTransferNumbers();

  const handleRetry = async () => {
    await refreshTransferNumbers();
  };

  const handleSelectTransferNumber = (value: string) => {
    // Create a synthetic event object to pass to onChange
    const syntheticEvent = {
      target: {
        name: "transferNumber",
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  // If user is not authenticated, show a simple message
  if (!user) {
    return (
      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You need to be logged in to view and select transfer numbers.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="transferNumber">Transfer Number</Label>
        {isLoading ? (
          <div className="flex items-center mt-2">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading transfer numbers...</span>
          </div>
        ) : error ? (
          <div className="space-y-2">
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry} 
                  className="w-fit mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
            <Input
              id="transferNumber"
              name="transferNumber"
              value={campaign.transferNumber}
              onChange={onChange}
              placeholder="Enter a phone number for transfers (e.g., +1 555-123-4567)"
              className="w-full mt-2"
            />
          </div>
        ) : transferNumbers && transferNumbers.length > 0 ? (
          <Select
            value={campaign.transferNumber}
            onValueChange={handleSelectTransferNumber}
          >
            <SelectTrigger id="transferNumber" className="w-full bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select a transfer number" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {transferNumbers.map((tn) => (
                <SelectItem key={tn.id} value={tn.number} className="py-2">
                  {tn.name} ({tn.number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2 mt-2">
            <div className="text-sm text-muted-foreground">
              No transfer numbers available. You can enter a number manually or add transfer numbers in the Transfer Numbers section.
            </div>
            <Input
              id="transferNumber"
              name="transferNumber"
              value={campaign.transferNumber}
              onChange={onChange}
              placeholder="Enter a phone number for transfers (e.g., +1 555-123-4567)"
              className="w-full"
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          This is the number that will receive calls when recipients request to speak with someone.
        </p>
      </div>
    </div>
  );
};
