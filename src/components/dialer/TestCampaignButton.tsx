
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Play } from 'lucide-react';
import { startTestCall } from '@/services/campaignService';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";

interface TestCampaignButtonProps {
  campaignId: string;
  disabled?: boolean;
}

export const TestCampaignButton = ({ campaignId, disabled = false }: TestCampaignButtonProps) => {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Missing Phone Number",
        description: "Please enter a phone number to call",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await startTestCall(campaignId, phoneNumber);
      setOpen(false);
      
      // Reset form
      setPhoneNumber('');
    } catch (error) {
      console.error('Error initiating test call:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Phone className="h-4 w-4 mr-2" />
        Test Campaign
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Test Campaign Call</DialogTitle>
            <DialogDescription>
              Make a test call to verify your campaign setup. Enter a phone number to receive the test call.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Your Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter a phone number where you can be reached right now.
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">What to expect:</h4>
                <ol className="text-sm text-muted-foreground ml-5 list-decimal">
                  <li>Your phone will ring</li>
                  <li>Answer the call</li>
                  <li>Listen to your greeting message</li>
                  <li>Press 1 to test the transfer</li>
                </ol>
              </div>
              
              <div className="flex items-center">
                <Badge variant="outline" className="text-xs ml-1">
                  This will not be counted in your campaign statistics
                </Badge>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initiating Call...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Make Test Call
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
