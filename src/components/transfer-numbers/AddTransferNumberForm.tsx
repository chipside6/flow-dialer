
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TransferFormInputs } from "./TransferFormInputs";
import { TransferFormButton } from "./TransferFormButton";

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
  const isMobile = useIsMobile();
  
  // Reset localSubmitting when parent isSubmitting changes
  useEffect(() => {
    if (!isSubmitting && localSubmitting) {
      console.log("Parent isSubmitting is false, resetting localSubmitting");
      setLocalSubmitting(false);
    }
  }, [isSubmitting, localSubmitting]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission
    e.preventDefault();
    console.log("Form submit event captured and prevented default");
    
    // Check if already submitting
    if (isSubmitting || localSubmitting) {
      console.log("Submission already in progress, ignoring submission");
      return;
    }
    
    const trimmedName = name.trim();
    const trimmedNumber = number.trim();
    const trimmedDescription = description.trim();
    
    // Validate input
    if (!trimmedName || !trimmedNumber) {
      console.log("Missing required fields, not submitting");
      return;
    }
    
    console.log("Form values prepared for submission:", { 
      name: trimmedName, 
      number: trimmedNumber, 
      description: trimmedDescription,
      isMobile
    });
    
    // Set local submitting state
    console.log("Starting form submission, setting localSubmitting");
    setLocalSubmitting(true);
    
    try {
      console.log("Calling onAddTransferNumber directly with:", trimmedName, trimmedNumber, trimmedDescription);
      const result = await onAddTransferNumber(trimmedName, trimmedNumber, trimmedDescription);
      
      console.log("Submission result:", result);
      
      // Only clear form if submission was successful
      if (result) {
        console.log("Success! Clearing form fields");
        setName("");
        setNumber("");
        setDescription("");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };
  
  // Determine if button should be disabled
  const isSubmittingNow = isSubmitting || localSubmitting;
  const buttonDisabled = isSubmittingNow || !name.trim() || !number.trim();
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Add New Transfer Number
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          data-mobile={isMobile ? "true" : "false"}
        >
          <TransferFormInputs 
            name={name}
            setName={setName}
            number={number}
            setNumber={setNumber}
            description={description}
            setDescription={setDescription}
            isSubmitting={isSubmittingNow}
          />
          
          <TransferFormButton 
            isSubmitting={isSubmittingNow}
            isDisabled={buttonDisabled}
          />
        </form>
      </CardContent>
    </Card>
  );
}
