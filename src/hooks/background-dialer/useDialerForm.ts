
import { useState, useEffect } from "react";
import { DialerFormData } from "@/components/background-dialer/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useDialerForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<DialerFormData>({
    sipProviderId: "",
    contactListId: "",
    transferNumber: "",
    maxConcurrentCalls: "3",
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
          setFormData(prev => ({ ...prev, transferNumber: data[0].phone_number }));
          console.log("Loaded transfer number:", data[0].phone_number);
        } else {
          console.log("No transfer numbers found for user");
        }
      } catch (error) {
        console.error("Error fetching transfer numbers:", error);
      } finally {
        setIsLoadingTransferNumbers(false);
      }
    };
    
    fetchTransferNumbers();
  }, [user]);
  
  const handleFormChange = (field: keyof DialerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return {
    formData,
    handleFormChange,
    isLoadingTransferNumbers
  };
};
