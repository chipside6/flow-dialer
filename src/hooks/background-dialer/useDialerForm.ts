
import { useState, useCallback } from "react";
import { DialerFormData } from "@/components/background-dialer/types";

// Define constants for default values
const DEFAULT_MAX_CONCURRENT_CALLS = 3;
const DEFAULT_PORT_NUMBER = 1;

export const useDialerForm = () => {
  // Initialize form data with default values
  const [formData, setFormData] = useState<DialerFormData>({
    contactListId: "",
    transferNumber: "",
    maxConcurrentCalls: DEFAULT_MAX_CONCURRENT_CALLS, // Default to 3 concurrent calls
    portNumber: DEFAULT_PORT_NUMBER, // Default to port 1
  });

  const [isLoadingTransferNumbers, setIsLoadingTransferNumbers] = useState(false);

  // Handle form field changes with better type safety
  const handleFormChange = useCallback(
    <T extends keyof DialerFormData>(field: T, value: DialerFormData[T]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Optional: Validation function (you can extend this based on your requirements)
  const validateForm = useCallback(() => {
    const { contactListId, maxConcurrentCalls, portNumber } = formData;
    if (!contactListId) {
      return { valid: false, message: "Contact List is required." };
    }
    if (maxConcurrentCalls <= 0) {
      return { valid: false, message: "Max concurrent calls must be greater than 0." };
    }
    if (portNumber <= 0) {
      return { valid: false, message: "Port number must be greater than 0." };
    }
    return { valid: true, message: "" };
  }, [formData]);

  // Reset form to default state
  const resetForm = useCallback(() => {
    setFormData({
      contactListId: "",
      transferNumber: "",
      maxConcurrentCalls: DEFAULT_MAX_CONCURRENT_CALLS,
      portNumber: DEFAULT_PORT_NUMBER,
    });
    setIsLoadingTransferNumbers(false);
  }, []);

  return {
    formData,
    handleFormChange,
    isLoadingTransferNumbers,
    validateForm,
    resetForm,
  };
};
