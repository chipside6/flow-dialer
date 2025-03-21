
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneForwarded, Plus, Loader2 } from "lucide-react";

interface AddTransferNumberFormProps {
  onAddTransferNumber: (name: string, number: string, description: string) => Promise<any>;
  isSubmitting: boolean;
}

export const AddTransferNumberForm = ({ 
  onAddTransferNumber, 
  isSubmitting 
}: AddTransferNumberFormProps) => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [localSubmitting, setLocalSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (isSubmitting || localSubmitting) {
      console.log("Submission already in progress, ignoring click");
      return;
    }
    
    console.log("Form submitted, setting localSubmitting to true");
    setLocalSubmitting(true);
    
    try {
      const result = await onAddTransferNumber(name, number, description);
      console.log("Submission result:", result ? "success" : "failure");
      
      if (result) {
        // Clear the form after successful submission
        setName("");
        setNumber("");
        setDescription("");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      console.log("Setting localSubmitting to false");
      setLocalSubmitting(false);
    }
  };
  
  // Use either parent or local submitting state
  const buttonDisabled = isSubmitting || localSubmitting;
  
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
              placeholder="Enter a name for this transfer destination"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={buttonDisabled}
            />
          </div>
          <div>
            <Label htmlFor="transfer-number">Phone Number</Label>
            <Input
              id="transfer-number"
              placeholder="Enter the phone number (e.g., +1-555-123-4567)"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={buttonDisabled}
            />
          </div>
          <div>
            <Label htmlFor="transfer-description">Description</Label>
            <Input
              id="transfer-description"
              placeholder="Enter a description for this transfer number"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={buttonDisabled}
            />
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={buttonDisabled}
          >
            {buttonDisabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <PhoneForwarded className="mr-2 h-4 w-4" />
                Add Transfer Number
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
