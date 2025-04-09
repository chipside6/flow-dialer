
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CallerIdSelectorProps {
  campaignId: string;
  onCallerIdChange: (callerId: string) => void;
  disabled?: boolean;
}

export const CallerIdSelector: React.FC<CallerIdSelectorProps> = ({
  campaignId,
  onCallerIdChange,
  disabled = false
}) => {
  const { toast } = useToast();
  const [callerId, setCallerId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Load caller ID for the campaign
  useEffect(() => {
    if (campaignId) {
      loadCampaignCallerId();
    }
  }, [campaignId]);
  
  // Load the current caller ID for the campaign
  const loadCampaignCallerId = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('caller_id')
        .eq('id', campaignId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCallerId(data.caller_id || '');
      }
    } catch (err) {
      console.error('Error loading campaign caller ID:', err);
    }
  };
  
  // Handle saving the caller ID
  const handleSaveCallerId = async () => {
    if (disabled || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Validate caller ID format - should be digits only
      const normalizedCallerId = callerId.replace(/\D/g, '');
      
      if (!normalizedCallerId) {
        throw new Error('Please enter a valid caller ID');
      }
      
      // Update the campaign with the caller ID
      const { error } = await supabase
        .from('campaigns')
        .update({ caller_id: normalizedCallerId })
        .eq('id', campaignId);
        
      if (error) throw error;
      
      // Update local state
      setCallerId(normalizedCallerId);
      onCallerIdChange(normalizedCallerId);
      
      toast({
        title: 'Caller ID updated',
        description: 'The campaign caller ID has been updated'
      });
    } catch (err) {
      console.error('Error updating caller ID:', err);
      toast({
        title: 'Error updating caller ID',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="callerId">Caller ID</Label>
      <div className="flex space-x-2">
        <Input
          id="callerId"
          value={callerId}
          onChange={(e) => setCallerId(e.target.value)}
          placeholder="e.g. 15551234567"
          disabled={disabled}
        />
        <Button
          variant="outline"
          onClick={handleSaveCallerId}
          disabled={disabled || isSaving}
        >
          {isSaving ? (
            <span className="flex items-center gap-1">Saving...</span>
          ) : (
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Save
            </span>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        This is the number that will be displayed on the recipient's caller ID
      </p>
    </div>
  );
};
