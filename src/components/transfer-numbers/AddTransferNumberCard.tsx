
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { TransferFormFields } from './TransferFormFields';
import { useToast } from "@/components/ui/use-toast";
import { useTransferNumberValidation } from '@/hooks/transfer-numbers/useTransferNumberValidation';

interface AddTransferNumberCardProps {
  onAddTransferNumber: (name: string, number: string, description: string) => Promise<any>;
  isSubmitting: boolean;
}

export const AddTransferNumberCard = ({
  onAddTransferNumber,
  isSubmitting
}: AddTransferNumberCardProps) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');
  const { validateTransferNumberInput } = useTransferNumberValidation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTransferNumberInput(name, number)) {
      return;
    }

    try {
      await onAddTransferNumber(name, number, description);
      // Reset form on success
      setName('');
      setNumber('');
      setDescription('');
    } catch (error) {
      toast({
        title: "Error adding transfer number",
        description: "There was a problem adding your transfer number. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Add New Transfer Number
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TransferFormFields
            name={name}
            number={number}
            description={description}
            onNameChange={setName}
            onNumberChange={setNumber}
            onDescriptionChange={setDescription}
            isSubmitting={isSubmitting}
          />

          <Button 
            type="submit" 
            disabled={isSubmitting || !name || !number}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Transfer Number
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
