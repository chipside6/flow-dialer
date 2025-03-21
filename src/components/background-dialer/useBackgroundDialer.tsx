
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { SipProvider, ContactList, DialStatus, DialerFormData } from "./types";
import { asteriskService } from "@/utils/asteriskService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useBackgroundDialer = (campaignId: string) => {
  const { user } = useAuth();
  const [sipProviders, setSipProviders] = useState<SipProvider[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  
  const [formData, setFormData] = useState<DialerFormData>({
    sipProviderId: "",
    contactListId: "",
    transferNumber: "",
    maxConcurrentCalls: "3",
    greetingFile: "greeting.wav"
  });
  
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [dialStatus, setDialStatus] = useState<DialStatus>({
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

  const handleFormChange = (field: keyof DialerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const startDialing = async () => {
    if (!formData.sipProviderId || !formData.contactListId) {
      toast({
        title: "Incomplete Configuration",
        description: "Please select a SIP provider and contact list before starting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await asteriskService.startDialing({
        contactListId: formData.contactListId,
        campaignId,
        transferNumber: formData.transferNumber,
        sipProviderId: formData.sipProviderId,
        greetingFile: formData.greetingFile,
        maxConcurrentCalls: formData.maxConcurrentCalls ? parseInt(formData.maxConcurrentCalls) : undefined
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

  return {
    sipProviders,
    contactLists,
    isLoadingProviders,
    isLoadingLists,
    formData,
    isDialing,
    currentJobId,
    dialStatus,
    handleFormChange,
    startDialing,
    stopDialing
  };
};
