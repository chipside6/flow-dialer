
import { useState } from "react";
import { DialerFormData } from "@/components/background-dialer/types";

export const useDialerForm = () => {
  const [formData, setFormData] = useState<DialerFormData>({
    sipProviderId: "",
    contactListId: "",
    transferNumber: "",
    maxConcurrentCalls: "3",
    greetingFile: "greeting.wav"
  });
  
  const handleFormChange = (field: keyof DialerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return {
    formData,
    handleFormChange
  };
};
