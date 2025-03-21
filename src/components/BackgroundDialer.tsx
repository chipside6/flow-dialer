
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, PhoneOff, Play, Pause, AlertCircle } from "lucide-react";
import { asteriskService } from "@/utils/asteriskService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface SipProvider {
  id: string;
  name: string;
}

interface ContactList {
  id: string;
  name: string;
  contactCount: number;
}

interface BackgroundDialerProps {
  campaignId: string;
}

const BackgroundDialer: React.FC<BackgroundDialerProps> = ({ campaignId }) => {
  const { user } = useAuth();
  const [sipProviders, setSipProviders] = useState<SipProvider[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  
  const [selectedSipProvider, setSelectedSipProvider] = useState<string>("");
  const [selectedContactList, setSelectedContactList] = useState<string>("");
  const [transferNumber, setTransferNumber] = useState<string>("");
  const [maxConcurrentCalls, setMaxConcurrentCalls] = useState<string>("3");
  const [greetingFile, setGreetingFile] = useState<string>("greeting.wav");
  
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [dialStatus, setDialStatus] = useState<{
    status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
    totalCalls: number;
    completedCalls: number;
    answeredCalls: number;
    failedCalls: number;
  }>({
    status: 'idle',
    totalCalls: 0,
    completedCalls: 0,
    answeredCalls: 0,
    failedCalls: 0
  });

  // Fetch SIP providers and contact lists
  useEffect(() => {
    const fetchProviders = async () => {
      if (!user) {
        setSipProviders([]);
        setIsLoadingProviders(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sip_providers')
          .select('id, name')
          .eq('user_id', user.id)
          .eq('active', true);

        if (error) throw error;
        
        setSipProviders(data || []);
      } catch (err) {
        console.error("Error fetching SIP providers:", err);
        toast({
          title: "Error loading SIP providers",
          description: "Could not load your SIP providers",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProviders(false);
      }
    };

    const fetchContactLists = async () => {
      if (!user) {
        setContactLists([]);
        setIsLoadingLists(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('contact_lists')
          .select(`
            id, 
            name,
            contact_list_items:contact_list_items(count)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        
        const transformedData = (data || []).map(list => ({
          id: list.id,
          name: list.name,
          contactCount: list.contact_list_items?.length || 0
        }));
        
        setContactLists(transformedData);
      } catch (err) {
        console.error("Error fetching contact lists:", err);
        toast({
          title: "Error loading contact lists",
          description: "Could not load your contact lists",
          variant: "destructive"
        });
      } finally {
        setIsLoadingLists(false);
      }
    };

    fetchProviders();
    fetchContactLists();
  }, [user]);
  
  // Poll for status updates when a job is running
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (currentJobId && isDialing) {
      intervalId = window.setInterval(async () => {
        try {
          const status = await asteriskService.getDialingStatus(currentJobId);
          
          setDialStatus({
            ...status,
            status: status.status === 'running' ? 'running' : 
                   status.status === 'completed' ? 'completed' : 
                   status.status === 'failed' ? 'failed' : 'stopped'
          });
          
          if (status.status === 'completed' || status.status === 'failed') {
            setIsDialing(false);
            clearInterval(intervalId);
            
            if (status.status === 'completed') {
              toast({
                title: "Dialing Complete",
                description: `Successfully completed dialing campaign with ${status.answeredCalls} answered calls.`,
              });
            } else {
              toast({
                title: "Dialing Failed",
                description: "There was an issue with the dialing operation.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Error polling for status:", error);
          toast({
            title: "Status Update Failed",
            description: "Could not get the latest dialing status.",
            variant: "destructive",
          });
        }
      }, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentJobId, isDialing]);
  
  const startDialing = async () => {
    if (!selectedSipProvider || !selectedContactList) {
      toast({
        title: "Incomplete Configuration",
        description: "Please select a SIP provider and contact list before starting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await asteriskService.startDialing({
        contactListId: selectedContactList,
        campaignId,
        transferNumber,
        sipProviderId: selectedSipProvider,
        greetingFile,
        maxConcurrentCalls: maxConcurrentCalls ? parseInt(maxConcurrentCalls) : undefined
      });
      
      setCurrentJobId(response.jobId);
      setIsDialing(true);
      setDialStatus({
        status: 'running',
        totalCalls: 0,
        completedCalls: 0,
        answeredCalls: 0,
        failedCalls: 0
      });
      
      toast({
        title: "Dialing Started",
        description: "The system is now dialing your contact list in the background.",
      });
    } catch (error) {
      console.error("Error starting dialing:", error);
      toast({
        title: "Failed to Start Dialing",
        description: "There was an error starting the dialing process.",
        variant: "destructive",
      });
    }
  };
  
  const stopDialing = async () => {
    if (!currentJobId) return;
    
    try {
      await asteriskService.stopDialing(currentJobId);
      setIsDialing(false);
      setDialStatus({
        ...dialStatus,
        status: 'stopped'
      });
      
      toast({
        title: "Dialing Stopped",
        description: "The dialing operation has been stopped.",
      });
    } catch (error) {
      console.error("Error stopping dialing:", error);
      toast({
        title: "Failed to Stop Dialing",
        description: "There was an error stopping the dialing process.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = dialStatus.totalCalls > 0 
    ? Math.round((dialStatus.completedCalls / dialStatus.totalCalls) * 100) 
    : 0;
  
  return (
    <Card className="border-border/40 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          Background Dialer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isDialing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sip-provider">SIP Provider</Label>
                <Select
                  value={selectedSipProvider}
                  onValueChange={setSelectedSipProvider}
                >
                  <SelectTrigger id="sip-provider" disabled={isLoadingProviders}>
                    <SelectValue placeholder={isLoadingProviders ? "Loading..." : "Select a SIP provider"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sipProviders.length === 0 ? (
                      <SelectItem value="none" disabled>No SIP providers available</SelectItem>
                    ) : (
                      sipProviders.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="contact-list">Contact List</Label>
                <Select
                  value={selectedContactList}
                  onValueChange={setSelectedContactList}
                >
                  <SelectTrigger id="contact-list" disabled={isLoadingLists}>
                    <SelectValue placeholder={isLoadingLists ? "Loading..." : "Select a contact list"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contactLists.length === 0 ? (
                      <SelectItem value="none" disabled>No contact lists available</SelectItem>
                    ) : (
                      contactLists.map(list => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name} ({list.contactCount} contacts)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transfer-number">Transfer Number (Optional)</Label>
                <Input
                  id="transfer-number"
                  placeholder="Enter transfer destination"
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="concurrent-calls">Max Concurrent Calls</Label>
                <Input
                  id="concurrent-calls"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="3"
                  value={maxConcurrentCalls}
                  onChange={(e) => setMaxConcurrentCalls(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="greeting-file">Greeting Audio File</Label>
              <Input
                id="greeting-file"
                placeholder="greeting.wav"
                value={greetingFile}
                onChange={(e) => setGreetingFile(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={startDialing} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoadingProviders || isLoadingLists || sipProviders.length === 0 || contactLists.length === 0}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Dialing
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Active Dialing Job</h3>
                <p className="text-sm text-muted-foreground">Job ID: {currentJobId}</p>
              </div>
              <Button variant="destructive" onClick={stopDialing}>
                <PhoneOff className="mr-2 h-4 w-4" />
                Stop Dialing
              </Button>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Progress</span>
                <span className="text-sm">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-md p-3 text-center">
                <p className="text-muted-foreground text-sm">Total Calls</p>
                <p className="text-xl font-bold">{dialStatus.totalCalls}</p>
              </div>
              
              <div className="bg-muted rounded-md p-3 text-center">
                <p className="text-muted-foreground text-sm">Completed</p>
                <p className="text-xl font-bold">{dialStatus.completedCalls}</p>
              </div>
              
              <div className="bg-muted rounded-md p-3 text-center">
                <p className="text-muted-foreground text-sm">Answered</p>
                <p className="text-xl font-bold">{dialStatus.answeredCalls}</p>
              </div>
              
              <div className="bg-muted rounded-md p-3 text-center">
                <p className="text-muted-foreground text-sm">Failed</p>
                <p className="text-xl font-bold">{dialStatus.failedCalls}</p>
              </div>
            </div>
            
            {dialStatus.status === 'running' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Dialing in Progress</p>
                    <p className="text-sm">The system is automatically dialing your contacts in the background.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackgroundDialer;
