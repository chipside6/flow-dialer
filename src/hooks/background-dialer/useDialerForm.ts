
import { useState, useEffect } from "react";
import { DialerFormData } from "@/components/background-dialer/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";

export const useDialerForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<DialerFormData>({
    sipProviderId: "",
    contactListId: "",
    transferNumber: "",
    maxConcurrentCalls: "1", // Fixed value
    greetingFile: "greeting.wav"
  });
  const [isLoadingTransferNumbers, setIsLoadingTransferNumbers] = useState(false);
  
  useEffect(() => {
    // Load the last used transfer number if available
    const fetchTransferNumbers = async () => {
      if (!user) return;
      
      try {
        setIsLoadingTransferNumbers(true);
        const { data, error } = await supabase
          .from('transfer_numbers')
          .select('phone_number')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            transferNumber: data[0].phone_number
          }));
          console.log("Loaded transfer number:", data[0].phone_number);
        } else {
          console.log("No transfer numbers found for user");
        }
      } catch (error) {
        console.error("Error fetching transfer numbers:", error);
        toast({
          title: "Error loading transfer numbers",
          description: "Please enter your transfer number manually",
          variant: "destructive"
        });
      } finally {
        // Ensure loading state gets cleared after timeout
        const timeout = setTimeout(() => {
          setIsLoadingTransferNumbers(false);
        }, 5000);
        
        return () => clearTimeout(timeout);
      }
    };
    
    fetchTransferNumbers();
    
    // Safety timeout to end loading state
    const safetyTimeout = setTimeout(() => {
      if (isLoadingTransferNumbers) {
        setIsLoadingTransferNumbers(false);
      }
    }, 8000);
    
    return () => clearTimeout(safetyTimeout);
  }, [user]);
  
  const handleFormChange = (field: keyof DialerFormData, value: string) => {
    if (field === "maxConcurrentCalls") {
      // Always set to "1" regardless of input
      setFormData(prev => ({ ...prev, maxConcurrentCalls: "1" }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return {
    formData,
    handleFormChange,
    isLoadingTransferNumbers
  };
};
