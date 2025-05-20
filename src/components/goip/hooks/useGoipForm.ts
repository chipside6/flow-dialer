
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { goipService } from '@/utils/asterisk/services/goipService';
import { goipFormSchema, GoipFormValues, goipFormDefaultValues } from '../form/GoipFormSchema';

export const useGoipForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showCredNotice, setShowCredNotice] = useState(true);
  
  const form = useForm<GoipFormValues>({
    resolver: zodResolver(goipFormSchema),
    defaultValues: goipFormDefaultValues
  });

  const onSubmit = async (values: GoipFormValues) => {
    if (!user?.id) return;

    setIsRegistering(true);
    
    try {
      // Use the goipService to register the device with auto-generated credentials
      const result = await goipService.registerDevice(
        user.id,
        values.deviceName,
        values.ipAddress,
        values.numPorts
      );

      // Make sure we always set isRegistering to false
      setIsRegistering(false);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({
        title: "Device registered successfully",
        description: "Your GoIP device has been registered and SIP credentials automatically generated."
      });

      form.reset();
    } catch (error) {
      console.error('Error registering device:', error);
      
      // Ensure loading state is reset
      setIsRegistering(false);
      
      toast({
        title: "Error registering device",
        description: error instanceof Error ? error.message : "Failed to register your device. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    form,
    isRegistering,
    showCredNotice,
    setShowCredNotice,
    onSubmit
  };
};
