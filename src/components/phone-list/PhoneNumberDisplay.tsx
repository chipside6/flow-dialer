
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Phone, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PhoneNumberDisplayProps {
  phoneNumbers: string[];
  handleRemoveNumber: (index: number) => void;
  isActionInProgress: boolean;
}

export const PhoneNumberDisplay: React.FC<PhoneNumberDisplayProps> = ({
  phoneNumbers,
  handleRemoveNumber,
  isActionInProgress,
}) => {
  if (phoneNumbers.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md text-muted-foreground">
        No phone numbers added yet
      </div>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-2">Phone Numbers ({phoneNumbers.length})</h3>
      <ScrollArea className="h-[150px] w-full rounded-md border p-2">
        <div className="space-y-2">
          {phoneNumbers.map((number, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-muted/50 p-2 rounded"
            >
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{number}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveNumber(index)}
                disabled={isActionInProgress}
                className="h-8 w-8 p-0"
              >
                {isActionInProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
