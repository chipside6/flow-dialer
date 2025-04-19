
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface AddPortDialogProps {
  deviceId: string;
  onPortAdded: () => void;
}

export const AddPortDialog = ({ deviceId, onPortAdded }: AddPortDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portNumber, setPortNumber] = useState('');
  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('goip_ports')
        .insert({
          device_id: deviceId,
          port_number: parseInt(portNumber),
          sip_username: sipUsername,
          sip_password: sipPassword,
          status: 'available'
        });

      if (error) throw error;

      toast({
        title: "Port added successfully",
        description: "The SIP port has been added to your device."
      });

      setOpen(false);
      onPortAdded();
      setPortNumber('');
      setSipUsername('');
      setSipPassword('');
    } catch (error) {
      console.error('Error adding port:', error);
      toast({
        title: "Error adding port",
        description: "Failed to add the port. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Port
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add SIP Port</DialogTitle>
          <DialogDescription>
            Configure a new SIP port for your GoIP device
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portNumber">Port Number</Label>
            <Input
              id="portNumber"
              type="number"
              min="1"
              max="8"
              required
              value={portNumber}
              onChange={(e) => setPortNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sipUsername">SIP Username</Label>
            <Input
              id="sipUsername"
              required
              value={sipUsername}
              onChange={(e) => setSipUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sipPassword">SIP Password</Label>
            <Input
              id="sipPassword"
              type="password"
              required
              value={sipPassword}
              onChange={(e) => setSipPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding Port...' : 'Add Port'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
