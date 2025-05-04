
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSupabaseUrl } from '@/integrations/supabase/client';

// More permissive schema that allows both IP addresses and hostnames
const formSchema = z.object({
  deviceName: z.string().min(2, 'Device name must be at least 2 characters'),
  ipAddress: z.string()
    .min(1, 'IP address is required')
    .refine(val => {
      // Allow both IP addresses and hostnames
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]{0,61}[a-zA-Z0-9])?$/;
      return ipRegex.test(val) || hostnameRegex.test(val);
    }, { message: 'Must be a valid IP address or hostname' }),
  numPorts: z.coerce.number().int().min(1).max(8).default(1)
});

export const RegisterDeviceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [requestTimeout, setRequestTimeout] = useState<NodeJS.Timeout | null>(null);

  // The form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      ipAddress: '',
      numPorts: 1
    }
  });

  // Clean up timeouts
  React.useEffect(() => {
    return () => {
      if (requestTimeout) clearTimeout(requestTimeout);
    };
  }, [requestTimeout]);

  const resetFormState = () => {
    setIsRegistering(false);
    if (requestTimeout) {
      clearTimeout(requestTimeout);
      setRequestTimeout(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to register a device.",
        variant: "destructive"
      });
      return;
    }
    
    // Reset states
    setIsRegistering(true);
    setRegistrationSuccess(false);
    setRegistrationError(null);

    // Set a timeout to prevent infinite loading state
    const timeout = setTimeout(() => {
      setIsRegistering(false);
      setRegistrationError("Request timed out. The server might be busy or unreachable. Please try again later.");
      toast({
        title: "Request timed out",
        description: "The server took too long to respond. Please try again.",
        variant: "destructive"
      });
    }, 30000); // 30 seconds timeout
    
    setRequestTimeout(timeout);

    try {
      console.log("Starting device registration with values:", values);
      
      // Get the Supabase URL to call the edge function
      const supabaseUrl = getSupabaseUrl();
      
      if (!supabaseUrl) {
        throw new Error('Could not determine Supabase URL');
      }
      
      // Get auth session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.access_token) {
        console.error("Auth error: No valid session found");
        throw new Error('Authentication required: Unable to get session');
      }
      
      // Call the edge function to register the device
      const response = await fetch(`${supabaseUrl}/functions/v1/register-goip-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          deviceName: values.deviceName,
          ipAddress: values.ipAddress,
          numPorts: values.numPorts
        })
      });
      
      // Get full response text for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Try to parse response as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
      }
      
      // Check if the request was successful
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || responseData.error || `Server error: ${response.status} ${response.statusText}`);
      }
      
      // Handle successful registration
      setRegistrationSuccess(true);
      
      // Clear form fields
      form.reset();
      
      // Show success message
      toast({
        title: "Device registered successfully",
        description: `Your GoIP device "${values.deviceName}" has been registered with ${values.numPorts} ports. SIP credentials have been automatically generated.`
      });
      
    } catch (error) {
      console.error('Error registering device:', error);
      
      // Set detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to register your device. Please try again.";
      
      setRegistrationError(errorMessage);
      
      // Show error toast
      toast({
        title: "Error registering device",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Reset form state
      resetFormState();
    }
  };

  const handleRetry = () => {
    setRegistrationError(null);
    setIsRegistering(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register GoIP Device</CardTitle>
        <CardDescription>Add a new GoIP device to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {registrationSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Device registered successfully! SIP credentials have been automatically generated.
              You can view them in your device details.
            </AlertDescription>
          </Alert>
        )}
        
        {registrationError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700">Registration Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {registrationError}
              <p className="mt-2 text-sm">
                Please verify your device information and try again.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="mt-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="MyGoIP-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address or Hostname</FormLabel>
                  <FormControl>
                    <Input placeholder="192.168.1.100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numPorts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Ports</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={8} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Device'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
