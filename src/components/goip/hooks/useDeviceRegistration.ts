
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase, getSupabaseUrl } from '@/integrations/supabase/client';
import { DeviceFormValues } from '../form/deviceFormSchema';
import { logger } from '@/utils/logger';

interface RegistrationResult {
  success: boolean;
  message: string;
}

export const useDeviceRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

  const registerDevice = async (values: DeviceFormValues) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to register a device.",
        variant: "destructive"
      });
      return;
    }

    // Clear any previous registration result
    setRegistrationResult(null);
    // Set registering state to true
    setIsRegistering(true);
    
    try {
      logger.info("Registering device with values:", values);
      
      // Call the Supabase Edge Function
      const { data: session } = await supabase.auth.getSession();
      const supabaseUrl = getSupabaseUrl();
      
      if (!session?.session?.access_token || !supabaseUrl) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/register-goip-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          deviceName: values.deviceName,
          ipAddress: values.ipAddress,
          numPorts: values.numPorts
        })
      });
      
      const result = await response.json();
      logger.info("Registration result:", result);
      
      if (!result.success) {
        throw new Error(result.message || "Failed to register device");
      }

      // Set successful registration result
      setRegistrationResult({
        success: true,
        message: `Device ${values.deviceName} registered successfully with ${values.numPorts} port(s)`
      });

      toast({
        title: "Device registered successfully",
        description: "Your GoIP device has been registered with auto-generated SIP credentials."
      });

      return true;
    } catch (error) {
      logger.error('Error registering device:', error);
      
      // Set failed registration result
      setRegistrationResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred during device registration."
      });
      
      toast({
        title: "Error registering device",
        description: error instanceof Error ? error.message : "An error occurred during device registration.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Always set isRegistering to false regardless of success or failure
      setIsRegistering(false);
    }
  };

  return {
    isRegistering,
    registrationResult,
    registerDevice
  };
};
