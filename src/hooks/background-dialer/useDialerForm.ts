
import { useState } from "react";
import { DialerFormData } from "@/components/background-dialer/types";

export const useDialerForm = () => {
  const [formData, setFormData] = useState<DialerFormData>({
    contactListId: "",
    transferNumber: "",
    maxConcurrentCalls: 3, // Default to 3 concurrent calls
    portNumber: 1 // Default to port 1
  });
  
  const [isLoadingTransferNumbers, setIsLoadingTransferNumbers] = useState(false);
  
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return {
    formData,
    handleFormChange,
    isLoadingTransferNumbers
  };
};
