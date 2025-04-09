
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TransferNumber {
  id: string;
  name: string;
  phone_number: string;
  description?: string;
}

interface TransferNumberSelectorProps {
  campaignId: string;
  onTransferNumberSelect: (transferNumber: string) => void;
}

export const TransferNumberSelector: React.FC<TransferNumberSelectorProps> = ({
  campaignId,
  onTransferNumberSelect
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [selectedNumberId, setSelectedNumberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [newNumberName, setNewNumberName] = useState('');
  const [newNumberValue, setNewNumberValue] = useState('');
  const [newNumberDescription, setNewNumberDescription] = useState('');
  
  // Fetch transfer numbers and current campaign settings
  useEffect(() => {
    if (user?.id && campaignId) {
      fetchTransferNumbers();
      fetchCampaignSettings();
    }
  }, [user?.id, campaignId]);
  
  const fetchTransferNumbers = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('transfer_numbers')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTransferNumbers(data || []);
    } catch (err) {
      console.error('Error fetching transfer numbers:', err);
      toast({
        title: 'Error',
        description: 'Failed to load transfer numbers.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCampaignSettings = async () => {
    if (!user?.id || !campaignId) return;
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('transfer_number')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data?.transfer_number) {
        // Find the transfer number ID by phone number
        const transferNumber = transferNumbers.find(
          tn => tn.phone_number === data.transfer_number
        );
        
        if (transferNumber) {
          setSelectedNumberId(transferNumber.id);
        }
      }
    } catch (err) {
      console.error('Error fetching campaign settings:', err);
    }
  };
  
  const handleSelectTransferNumber = (id: string) => {
    setSelectedNumberId(id);
    
    const selectedNumber = transferNumbers.find(tn => tn.id === id);
    
    if (selectedNumber && campaignId) {
      // Update campaign with selected transfer number
      updateCampaignTransferNumber(selectedNumber.phone_number);
      
      // Call the prop callback
      onTransferNumberSelect(selectedNumber.phone_number);
    }
  };
  
  const updateCampaignTransferNumber = async (phoneNumber: string) => {
    if (!user?.id || !campaignId) return;
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ transfer_number: phoneNumber })
        .eq('id', campaignId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Transfer number updated',
        description: 'Campaign has been updated with the selected transfer number.'
      });
    } catch (err) {
      console.error('Error updating campaign transfer number:', err);
      toast({
        title: 'Error',
        description: 'Failed to update campaign transfer number.',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddTransferNumber = async () => {
    if (!user?.id) return;
    
    if (!newNumberName.trim() || !newNumberValue.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and phone number are required.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsAddingNumber(true);
    
    try {
      const { data, error } = await supabase
        .from('transfer_numbers')
        .insert({
          user_id: user.id,
          name: newNumberName.trim(),
          phone_number: newNumberValue.trim().replace(/\D/g, ''),
          description: newNumberDescription.trim() || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Transfer number added',
        description: 'New transfer number has been added successfully.'
      });
      
      setTransferNumbers([...transferNumbers, data]);
      setSelectedNumberId(data.id);
      onTransferNumberSelect(data.phone_number);
      
      // Reset form
      setNewNumberName('');
      setNewNumberValue('');
      setNewNumberDescription('');
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error adding transfer number:', err);
      toast({
        title: 'Error',
        description: 'Failed to add transfer number.',
        variant: 'destructive'
      });
    } finally {
      setIsAddingNumber(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Transfer Number
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Number
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading transfer numbers...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Select
                value={selectedNumberId}
                onValueChange={handleSelectTransferNumber}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a transfer number" />
                </SelectTrigger>
                <SelectContent>
                  {transferNumbers.map((number) => (
                    <SelectItem key={number.id} value={number.id}>
                      {number.name} ({number.phone_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedNumberId && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Selected Number:</p>
                  <p className="text-sm">
                    {transferNumbers.find(n => n.id === selectedNumberId)?.phone_number}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transfer Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newNumberName}
                onChange={(e) => setNewNumberName(e.target.value)}
                placeholder="Call Center 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input
                id="number"
                value={newNumberValue}
                onChange={(e) => setNewNumberValue(e.target.value)}
                placeholder="18005551234"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newNumberDescription}
                onChange={(e) => setNewNumberDescription(e.target.value)}
                placeholder="Main office call center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTransferNumber}
              disabled={isAddingNumber}
            >
              {isAddingNumber ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Transfer Number'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
