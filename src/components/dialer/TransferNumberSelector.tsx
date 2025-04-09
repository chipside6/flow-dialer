
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface TransferNumberSelectorProps {
  campaignId: string;
  onTransferNumberSelect: (transferNumber: string) => void;
  disabled?: boolean;
}

export const TransferNumberSelector: React.FC<TransferNumberSelectorProps> = ({
  campaignId,
  onTransferNumberSelect,
  disabled = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transferNumbers, setTransferNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  
  // Load transfer numbers from the database
  useEffect(() => {
    if (user?.id) {
      loadTransferNumbers();
    }
  }, [user?.id]);
  
  // Load current transfer number for the campaign
  useEffect(() => {
    if (campaignId) {
      loadCampaignTransferNumber();
    }
  }, [campaignId]);

  // Load transfer numbers from the database
  const loadTransferNumbers = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('transfer_numbers')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        setTransferNumbers(data);
      }
    } catch (err) {
      console.error('Error loading transfer numbers:', err);
      toast({
        title: 'Error loading transfer numbers',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load the current transfer number for the campaign
  const loadCampaignTransferNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('transfer_number')
        .eq('id', campaignId)
        .single();
        
      if (error) throw error;
      
      if (data && data.transfer_number) {
        setSelectedNumber(data.transfer_number);
      }
    } catch (err) {
      console.error('Error loading campaign transfer number:', err);
    }
  };
  
  // Handle selection of a transfer number
  const handleTransferNumberChange = async (value: string) => {
    if (disabled) return;
    
    setSelectedNumber(value);
    onTransferNumberSelect(value);
    
    // Update the campaign with the selected transfer number
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
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="transferNumber">Transfer Number</Label>
      <Select
        onValueChange={handleTransferNumberChange}
        value={selectedNumber}
        disabled={disabled || isLoading || transferNumbers.length === 0}
      >
        <SelectTrigger id="transferNumber">
          <SelectValue placeholder={isLoading ? 'Loading...' : 'Select a transfer number'} />
        </SelectTrigger>
        <SelectContent>
          {transferNumbers.map(number => (
            <SelectItem key={number.id} value={number.phone_number}>
              {number.name} ({number.phone_number})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        This is the number where calls will be transferred when users press 1
      </p>
    </div>
  );
};
