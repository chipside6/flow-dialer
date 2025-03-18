
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneForwarded, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TransferNumber } from "@/types/transferNumbers";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransferNumberFormProps {
  onAddTransferNumber: (transferNumber: TransferNumber) => void;
}

export const TransferNumberForm = ({ onAddTransferNumber }: TransferNumberFormProps) => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const isMobile = useIsMobile();
  
  const handleAddTransferNumber = () => {
    if (!name || !number) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and a number",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation for phone number format
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(number)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    const newTransferNumber: TransferNumber = {
      id: Date.now().toString(),
      name,
      number,
      description: description || "No description provided",
      dateAdded: new Date(),
      callCount: 0
    };
    
    onAddTransferNumber(newTransferNumber);
    setName("");
    setNumber("");
    setDescription("");
    
    toast({
      title: "Transfer number added",
      description: `${name} (${number}) has been added successfully`,
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Add New Transfer Number
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="transfer-name">Name</Label>
            <Input
              id="transfer-name"
              placeholder={isMobile ? "Destination name" : "Enter a name for this transfer destination"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="transfer-number">Phone Number</Label>
            <Input
              id="transfer-number"
              placeholder={isMobile ? "Phone (e.g. +1-555-123-4567)" : "Enter the phone number (e.g., +1-555-123-4567)"}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="transfer-description">Description</Label>
            <Input
              id="transfer-description"
              placeholder={isMobile ? "Brief description" : "Enter a description for this transfer number"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleAddTransferNumber}>
            <PhoneForwarded className="mr-2 h-4 w-4" />
            Add Transfer Number
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
