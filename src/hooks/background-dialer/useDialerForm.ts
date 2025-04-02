
import { useState } from "react";
import { DialerFormData } from "@/components/background-dialer/types";

export const useDialerForm = () => {
  const [formData, setFormData] = useState<DialerFormData>({
    sipProviderId: "",
    contactListId: "",
    transferNumber: "",
    maxConcurrentCalls: 1 // Default to 1 concurrent call
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
