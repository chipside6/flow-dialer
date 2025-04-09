
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CallerIdSelectorProps {
  campaignId: string;
  onCallerIdChange: (callerId: string) => void;
}

export const CallerIdSelector: React.FC<CallerIdSelectorProps> = ({
  campaignId,
  onCallerIdChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [callerId, setCallerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch current caller ID from campaign
  useEffect(() => {
    if (user?.id && campaignId) {
      fetchCampaignCallerId();
    }
  }, [user?.id, campaignId]);
  
  const fetchCampaignCallerId = async () => {
    if (!user?.id || !campaignId) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('caller_id')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data?.caller_id) {
        setCallerId(data.caller_id);
      }
    } catch (err) {
      console.error('Error fetching campaign caller ID:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveCallerId = async () => {
    if (!user?.id || !campaignId) return;
    
    if (!callerId.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Caller ID is required.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ caller_id: callerId.trim() })
        .eq('id', campaignId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Caller ID updated',
        description: 'Campaign has been updated with the new caller ID.'
      });
      
      // Call the prop callback
      onCallerIdChange(callerId.trim());
    } catch (err) {
      console.error('Error updating campaign caller ID:', err);
      toast({
        title: 'Error',
        description: 'Failed to update caller ID.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Caller ID</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
              placeholder="Enter caller ID (e.g., 18005551234)"
            />
            <Button
              onClick={handleSaveCallerId}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Caller ID'
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              This is the number that will be displayed to call recipients.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
