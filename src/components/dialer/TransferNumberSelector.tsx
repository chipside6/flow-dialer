
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TransferNumber } from '@/types/transferNumber';

interface TransferNumberSelectorProps {
  campaignId: string;
  onTransferNumberSelect: (transferNumber: string) => void;
  transferNumbers: TransferNumber[];
  isLoading: boolean;
  selectedTransferNumber: string;
  disabled?: boolean;
}

export const TransferNumberSelector: React.FC<TransferNumberSelectorProps> = ({
  campaignId,
  onTransferNumberSelect,
  transferNumbers,
  isLoading,
  selectedTransferNumber,
  disabled = false
}) => {
  const { toast } = useToast();
  
  // Handle selection of a transfer number
  const handleTransferNumberChange = async (value: string) => {
    if (disabled) return;
    
    onTransferNumberSelect(value);
    
    // Update the campaign with the selected transfer number if we have a campaign ID
    if (campaignId) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ transfer_number: value })
          .eq('id', campaignId);
          
        if (error) throw error;
        
        toast({
          title: 'Transfer number updated',
          description: 'The campaign transfer number has been updated'
        });
      } catch (err) {
        console.error('Error updating transfer number:', err);
        toast({
          title: 'Error updating transfer number',
          description: err instanceof Error ? err.message : 'An unknown error occurred',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="transferNumber">Transfer Number</Label>
      <Select
        onValueChange={handleTransferNumberChange}
        value={selectedTransferNumber}
        disabled={disabled || isLoading || transferNumbers.length === 0}
      >
        <SelectTrigger id="transferNumber">
          <SelectValue placeholder={isLoading ? 'Loading...' : 'Select a transfer number'} />
        </SelectTrigger>
        <SelectContent>
          {transferNumbers.map(number => (
            <SelectItem key={number.id} value={number.number}>
              {number.name} ({number.number})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        This is the number where calls will be transferred when users press 1
      </p>
    </div>
  );
};
