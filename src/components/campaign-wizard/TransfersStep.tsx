
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface TransferNumber {
  id: string;
  name: string;
  phone_number: string;
}

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TransfersStep = ({ campaign, onChange }: TransfersStepProps) => {
  const { user } = useAuth();
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransferNumbers = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('transfer_numbers')
          .select('id, name, phone_number')
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setTransferNumbers(data);
        }
      } catch (error) {
        console.error("Error fetching transfer numbers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransferNumbers();
  }, [user]);

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

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="transferNumber">Transfer Number</Label>
        {transferNumbers.length > 0 ? (
          <Select
            value={campaign.transferNumber}
            onValueChange={handleSelectTransferNumber}
          >
            <SelectTrigger id="transferNumber">
              <SelectValue placeholder="Select a transfer number" />
            </SelectTrigger>
            <SelectContent>
              {transferNumbers.map((tn) => (
                <SelectItem key={tn.id} value={tn.phone_number}>
                  {tn.name} ({tn.phone_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="transferNumber"
            name="transferNumber"
            value={campaign.transferNumber}
            onChange={onChange}
            placeholder="Enter a phone number for transfers (e.g., +1 555-123-4567)"
          />
        )}
        <p className="text-sm text-muted-foreground mt-1">
          This is the number that will receive calls when recipients request to speak with someone.
        </p>
      </div>
    </div>
  );
};
