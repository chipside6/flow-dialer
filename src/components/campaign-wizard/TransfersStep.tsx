
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";
import { Button } from "@/components/ui/button";
import { PlusCircle, PhoneForwarded, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { fetchUserTransferNumbers } from "@/services/supabase/transferNumbersService";
import { TransferNumber } from "@/types/transferNumber";

interface TransfersStepProps {
  campaign: CampaignData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string | number) => void;
}

export const TransfersStep: React.FC<TransfersStepProps> = ({ 
  campaign, 
  onChange,
  onSelectChange
}) => {
  // Available ports for GoIP (typically 1-4 for a 4-port GoIP)
  const availablePorts = [1, 2, 3, 4];
  const { user } = useAuth();
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
  const [manualEntry, setManualEntry] = useState(true);
  
  // Load user's transfer numbers when component mounts
  useEffect(() => {
    const loadTransferNumbers = async () => {
      if (!user?.id) return;
      
      setIsLoadingNumbers(true);
      try {
        const numbers = await fetchUserTransferNumbers(user.id);
        setTransferNumbers(numbers);
        
        // If campaign already has a transfer number that matches one from the list,
        // switch to selection mode
        if (campaign.transferNumber && numbers.some(n => n.number === campaign.transferNumber)) {
          setManualEntry(false);
        }
      } catch (error) {
        console.error("Error loading transfer numbers:", error);
      } finally {
        setIsLoadingNumbers(false);
      }
    };
    
    loadTransferNumbers();
  }, [user?.id, campaign.transferNumber]);
  
  // Handle selection of existing transfer number
  const handleTransferNumberSelect = (value: string) => {
    // If "manual entry" is selected
    if (value === "manual") {
      setManualEntry(true);
      return;
    }
    
    // Find the selected transfer number
    const selected = transferNumbers.find(num => num.id === value);
    if (selected) {
      // Update the campaign with the selected number
      const fakeEvent = {
        target: {
          name: "transferNumber",
          value: selected.number
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(fakeEvent);
      setManualEntry(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6 pb-8 space-y-5">
        <div>
          <h3 className="text-lg font-medium">Transfer Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure where calls should be transferred when a prospect responds.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transferNumberSelect">Transfer Number</Label>
            
            {isLoadingNumbers ? (
              <div className="flex items-center text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading your transfer numbers...
              </div>
            ) : (
              <>
                <Select 
                  value={manualEntry ? "manual" : transferNumbers.find(n => n.number === campaign.transferNumber)?.id || "manual"}
                  onValueChange={handleTransferNumberSelect}
                >
                  <SelectTrigger id="transferNumberSelect">
                    <SelectValue placeholder="Select or enter transfer number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Enter manually</SelectItem>
                    
                    {transferNumbers.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Your transfer numbers
                        </div>
                        {transferNumbers.map(number => (
                          <SelectItem key={number.id} value={number.id}>
                            <div className="flex flex-col">
                              <span>{number.name}</span>
                              <span className="text-xs text-muted-foreground">{number.number}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                {manualEntry && (
                  <Input
                    id="transferNumber"
                    name="transferNumber"
                    placeholder="e.g. +1 (555) 123-4567"
                    value={campaign.transferNumber}
                    onChange={onChange}
                    className="mt-2"
                  />
                )}
                
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">
                    This is the phone number where live calls will be transferred when answered.
                  </p>
                  
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-xs h-auto p-0"
                    asChild
                  >
                    <a href="/transfer-numbers" target="_blank" rel="noopener noreferrer">
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Manage Transfer Numbers
                    </a>
                  </Button>
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portNumber">GoIP Port</Label>
            <Select 
              value={(campaign.portNumber || 1).toString()}
              onValueChange={(value) => onSelectChange("portNumber", parseInt(value))}
            >
              <SelectTrigger id="portNumber">
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.map(port => (
                  <SelectItem key={port} value={port.toString()}>
                    Port {port}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select which GoIP port to use for outgoing calls.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
